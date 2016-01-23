# -*- coding: UTF-8 -*-

from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic import View, TemplateView
from django.http import HttpResponseRedirect, JsonResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from .form import createContainerForm
from .models import ResourceUsage
from .myThread import MyThread
import urllib
import urllib2
import json
import time

#global endpoint

endpoint = 'http://10.103.241.154:2377'

#存储当前已经运行资源收集模块的容器的name　防止一个容器开启多个thread收集resource usage
names = []

def index(request, *args, **kwargs):
    return render(request, 'index.html')
def resource(request, *args, **kwargs):
    get_resource_info_url = request.GET.get('info_url',None)
    if get_resource_info_url is None:
        return JsonResponse({
            'status': 'error',
            'msg': _('inValid url'),
        })

    req_data= json.loads(urllib2.urlopen(get_resource_info_url).read())

    def format_data(data):
        nodes  = int(data[3][1]) #nodes number
        data = data[4:]
        node_array = []
        for i in range(nodes):
            name = data[i*5][0]
            cpu = data[i*5+2][1].split('/')
            mem = data[i*5+3][1].split('/')
            node = dict(name=name, cpu_use=int(cpu[0]), cpu_has=int(cpu[1]), mem_use=mem[0], mem_has=mem[1])
            node_array.append(node)
        _data=dict(nodes=nodes, node_array=node_array)
        return _data

    data = format_data(req_data['DriverStatus'])
    return JsonResponse({
        'status': 'ok',
        'msg': data,
    })
@csrf_exempt
def delete_container_or_image(request, method):
    if method == 'delete':
        delete_url = request.GET.get('delete_url',None)
        if delete_url is None:
            return JsonResponse({
                'status': 'error',
                'msg': 'inValid url',
            })
        req = urllib2.Request(delete_url)
        req.get_method = lambda:'DELETE'
        code = 200
        try:
            res = urllib2.urlopen(req)
        except urllib2.HTTPError, e:
            code = e.code
            return JsonResponse({
                'status': 'error',
                'msg': delete_url,
                'code': code
            })
        return JsonResponse({
            'status': 'ok',
            'code': code
        })
@csrf_exempt
def new_container(request):
    #json str to dict
    data = json.loads(request.body)
    url = data['url']
    params = data['params']

    if url is None or params is None:
        return JsonResponse({
            'status': 'error',
            'msg': 'invalid data',
            })

    params = json.dumps(params)
    req = urllib2.Request(url=url, data=params)
    req.add_header('Content-Type', 'application/json')
    code = 200
    try:
        res = urllib2.urlopen(req)
    except urllib2.HTTPError,e:
        code = e.code
        return JsonResponse({
            'status': 'error',
            'code': code
        })
    return JsonResponse({
        'status':'ok',
        'code':code
    })
# determine whether the current container is running by name

def is_run_current_container(name):
    url = endpoint+'/containers/'+name+'/json'
    req = urllib2.Request(url=url)
    try:
        res=urllib2.urlopen(req)
        req_data=json.loads(res.read())

        if(req_data['State']['Running']):
            return True
        else:
            # 从names数组中移除已经停止的容器的name
            names.remove[name]
            return False

    except urllib2.HTTPError, e:
        code = e.code
        return 'error'
def get_current_reource_usage(url):
    req = urllib2.Request(url=url)
    try:
        res = urllib2.urlopen(req)
        req_data= json.loads(res.read())
        print req_data['cpu_stats']['cpu_usage']['total_usage']

        if req_data['cpu_stats']['cpu_usage']['total_usage'] == 0:
            return 'error'
        return req_data

    except urllib2.HTTPError,e:
        print 'error'
        code = e.code
        return 'error'
#  screen and format resource data

def screen_and_format(old_data, new_data, name):

    ISOTIME = '%Y-%m-%d %X'

    service_name = name


    # 计算总共的ｃｐｕ利用率
    cpu_total_usage = new_data['cpu_stats']['cpu_usage']['total_usage'] - old_data['cpu_stats']['cpu_usage']['total_usage']
    cpu_system_usage = new_data['cpu_stats']['system_cpu_usage'] - old_data['cpu_stats']['system_cpu_usage']
    cpu_num = len(old_data['cpu_stats']['cpu_usage']['percpu_usage'])

    cpu_percent = round((float(cpu_total_usage)/float(cpu_system_usage))*cpu_num*100.0,2)

    #计算ｍｅｍ利用率
    memory_limit = new_data['memory_stats']['limit']
    memory_usage = new_data['memory_stats']['usage']
    memory_percent=round(float(memory_usage)/float(memory_limit)*100.0,2)

    network_rx_bytes = new_data['networks']['eth0']['rx_bytes']
    network_tx_bytes = new_data['networks']['eth0']['tx_bytes']

    current_time = time.strftime(ISOTIME, time.localtime())

    format_data={
        'service_name': service_name,
        'cpu_percent': cpu_percent,
        'memory_limit': memory_limit,
        'memory_usage': memory_usage,
        'memory_percent': memory_percent,
        'network_rx_bytes': network_rx_bytes,
        'network_tx_bytes': network_tx_bytes,
        'collect_time': current_time,
    }
    print(format_data)
    return format_data

def store_data_to_database(data):
    resource_instance = ResourceUsage(
                            service_name = data['service_name'],
                            cpu_percent = data['cpu_percent'],
                            memory_limit = data['memory_limit'],
                            memory_usage = data['memory_usage'],
                            memory_percent = data['memory_percent'],
                            network_rx_bytes = data['network_rx_bytes'],
                            network_tx_bytes = data['network_tx_bytes'],
                            collect_time = data['collect_time']
                            )
    resource_instance.save()

def get_current_resource_usage_from_database(name):
    data_objects = ResourceUsage.objects.filter(service_name=name).order_by('collect_time')
    print(len(data_objects));
    if len(data_objects) >=20:
        length = len(data_objects)
        data_objects = data_objects[length-21:length-1]
    print(len(data_objects));
    return data_objects
def format_data(data):
    dataArray = []
    for item in data:
        temp = {}
        temp['collect_time'] =item.collect_time
        temp['cpu_percent'] =item.cpu_percent
        temp['memory_percent'] =item.memory_percent
        temp['network_rx_bytes'] =item.network_rx_bytes
        temp['network_tx_bytes'] =item.network_tx_bytes
        dataArray.append(temp)

    return dataArray
@csrf_exempt
def container_resource_stats(request, name):
    data = get_current_resource_usage_from_database(name)
    _data = format_data(data)

    return JsonResponse({
        'data': _data
    })
#store resource-related data to database per 30 seconds
# 当容器开始运行的时候， 会调用此函数
# 此时函数主体 不停的获取需要的数据 并 存入数据库（每30秒获取一次）
# 当容器停止时，停止读取数据
def store_resource_usage_pertwosecond(name):
    url = endpoint+'/containers/'+name+'/stats?stream=false'
    while(is_run_current_container(name)):
        # 通过计算两次的差值获取ｃｐｕ的利用率

        old_resource_data = get_current_reource_usage(url)
        new_resource_data = get_current_reource_usage(url)
        if old_resource_data == 'error':
            store_flag = False
            return
        else:
            # 筛选并格式化需要的数据
            data =screen_and_format(old_resource_data, new_resource_data, name)
            #存入数据库
            store_data_to_database(data)
        # 设置每1秒读取一次　用于测试
        #　实际由于操作数据库　会有额外的５-7秒增加
        time.sleep(1)



@csrf_exempt
def add_thread_for_get_resource_usage(request, name):
    print name
    status = 'fail'
    if name not in names:
        names.append(name)
        new_thread = MyThread(store_resource_usage_pertwosecond,
                            (name,),
                            store_resource_usage_pertwosecond.__name__)
        new_thread.start()
        status = 'success'
    else:
        status='already collect'
    return JsonResponse({
        'status': status
    })
