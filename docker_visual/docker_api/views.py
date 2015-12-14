from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic import View, TemplateView
from django.http import HttpResponseRedirect, JsonResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from .form import createContainerForm
import urllib
import urllib2
import json
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
