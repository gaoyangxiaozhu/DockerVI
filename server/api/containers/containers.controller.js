/**
 * @author gaoyangyang
 * @description
 * 容器相关的操作
 */
var  request = require('../../components/superagent');
var        Q = require('q');
var    async = require('async');
var  express = require('express');
var endpoint = require('../endpoint').SWARMADDRESS;


function formatContainerState(state){
        error = state.Error;
        running = state.Running;
        if(error){
            return 'error';
        }
        return running ? 'running': 'stop';
}
function formatBindPorts(ports){
    var portList=[];
    for(var exposePort in ports){
        var bindPortList = ports[exposePort];
        if(bindPortList && bindPortList.length > 0){
            for(var index in bindPortList){
                var bindPort = bindPortList[index];
                var item = {};
                item.exposePort = exposePort;
                item.bindHostIp = bindPort.HostIp;
                item.bindHostPort = bindPort.HostPort;
                portList.push(item);
            }
        }
    }
    // return porlist , the value that every item in list  is 'exposePort' , bindIp, bindHostPort
    return portList;
}
function formatVolumes(binds){
    var volumesList = [];
    for(var index in binds){
        var item = {};
        item.volumeInContainer = binds[index].split(':')[0];
        item.volumeInHost = binds[index].split(':')[1];
        volumesList.push(item);
    }
    return volumesList;
}
// format env define by  self
function formatEnv(env){
    var envList = [];
    for(var index in env){
        var item={};
        item.name= env[index].split('=')[0];
        item.value = env[index].split('=')[1];

        envList.push(item);
    }

    return envList;
}
// format link
function formatLinks(links){
    var linkList =[];
    if(links){
        for(var index in links){
            var item = {};
            item.server = links[index].split(':')[0].slice(1);
            item.alias = links[index].split(':')[1].slice(1);

            linkList.push(item);
        }
    }
    return linkList;
}
    // format name
function formatContainerName(name){
    name = name.slice(1); //去掉首字符'/'
    //如果不包括'/' 则直接返回容器名称
    if(name.indexOf('/') < 0){
        return name;
    }
    var names = name.split('/');
    var node = names[0];
    name = names[1];
    if(node && node[0] == '/'){
        node=node.slice(1);
    }
    if(name && name[0] == '/'){
        name=name.slice(1);
    }
    return [node, name];
}

// format APT function
function formatData(data){
    var formatData = {};
    // get state
    formatData.Status= formatContainerState(data.State);
    // get portList
    formatData.portList = formatBindPorts(data.NetworkSettings.Ports);
    // gett volumeList
	formatData.volumesList = formatVolumes(data.HostConfig.Binds);

    // get envList
    formatData.envList = formatEnv(data.Config.Env);
    // get linkLis
    formatData.linkList = formatLinks(data.HostConfig.Links);

    // get name  && node
    formatData.name = formatContainerName(data.Name);
    //node name
    formatData.node = data.Node.Name;
    return formatData;
}
//aysnc map中用于获取容器状态的迭代器
function getContainerStatus(data, cb){
    var id = data.Id;
    var url = endpoint + '/containers/' + id + '/json';

    request.get(url)
	.then(function(response){
			var body = response.body;
			if(!response.ok){
					cb('error', null);
			}
            try {
                delete data.Status;//删除原有的状态字段
                //获取格式化后的状态字段
                data.status = formatContainerState(body.State);
                cb(null, data);
            } catch(e){
                cb(e.message, null);
            }
	}).fail(function(err){
			cb(err.message, null);
	});

}
exports.getContainerList = function(req, res){

	var currentPage = (parseInt(req.query.currentPage) > 0)?parseInt(req.query.currentPage):1;
	var itemsPerPage = (parseInt(req.query.itemsPerPage) > 0)?parseInt(req.query.itemsPerPage):10;

	var url = endpoint + '/containers/json?all=1';

	request.get(url)
	.then(function(response){
			var data = response.body;
			if(!response.ok){
					throw new Error("error");
			}
			//返回当前需要的数据
			data = data.slice((currentPage-1)*10, (currentPage-1)*10 + itemsPerPage);
            //获取每个容器的镜像标签
            return data.map(function(item, index){
                var tag = item.Image.split(':')[1];
                item.imageTag = tag ? tag : 'latest';
                return item;
            });
	})
    .then(function(data){
        //获取容器列表中每个容器的名字和主机名
        return data.map(function(item, index){
                    var names = formatContainerName(item.Names[0]);
                    item.node = names[0];
                    item.name = names[1];
                    return item;
               });
    })
    .then(function(data){
        //获取每个容器的运行状态
        async.map(data, getContainerStatus, function(err, results){
            if(err){
                res.status(404).send({'error_msg': err.message});
            }
            console.log(results);
            res.send(results);
        });
    }).fail(function(err){
        res.status(404).send({'error_msg': err.message});
	});
};
exports.getContainerCount = function(req, res){
	var url = endpoint + '/containers/json?all=1';

	request.get(url)
	.then(function(response){
			var _data = response.body;
			if(!response.ok){
					throw new Error("error");
			}
			res.send({count : _data.length });
	}).fail(function(err){
			res.status(404).send({'error_msg': 'error'});
	});

};
//container detail msg
exports.getContainer = function(req, res){

	var id = req.params.id;
	var url = endpoint + '/containers/' + id + '/json';
	request.get(url)
	.then(function(response){
			var _data = response.body;
			if(!response.ok){
					throw new Error("error");
			}
            _data = formatData(_data);
			res.send(_data);
	}).fail(function(err){
			res.status(404).send({'error_msg': err.message});
	});
};
exports.createContainer = function(req, res){

    var data = req.body.data;
    request.post(url)
    .then(function(response){
        if(!response.ok){
                throw new Error("error");
        }
        res.send({'msg': 'ok'});
    }).fail(function(err){
			res.status(404).send({'error_msg': err.message});
	});
};

exports.deleteContainer = function(req, res){
	var id = req.params.id;
	var action = 'delete';
	operateContainer(req, res, id, 'delete');
};
exports.updateContainer = function(req, res){
	var id = req.params.id;
	var action = req.body.action;
	operateContainer(req, res, id, action);
};

function operateContainer(req, res, id, action){

	var url = endpoint + '/containers/' + id;
	switch (action){
		case 'delete':
				request.del(url)
				.then(function(response){
						var _data = request.body;
						if(!request.ok){
								throw new Error("error");
						}
						res.send({ data : 'success'});
				}).fail(function(err){
						res.send({'error_msg': 'error'});
				});
			break;
		case 'start':
			url = url + '/start';
			request.post(url)
			.then(function(request){
				if(!request.ok){
						throw new Error("error");
				}
					res.send({'data': 'success'});
			}).fail(function(err){
					res.send({'error_msg': 'error'});
			});
			break;
		case 'stop':
			url = url + '/stop';
			request.post(url)
			.then(function(err, request){
					res.send({'data': 'success'});
			}).fail(function(err){
					res.send({'error_msg': 'error'});
			});
			break;
		default:
			url = url + 'restart';
			request.post(url)
			.then(function(request){
				res.send({'data': 'success'});
		 }).fail(function(err){
				 res.send({'error_msg': 'error'});
		 });
		 break;
	}
}
