(function () {
	'use strict';
	angular.module('dockerApp.service')
    .factory('formatData', function(){
        var getPostDataFormat = function(image, containerName, containerSize, portList, envList, linkList, volumeList, cmd){
            function getVolumeFormat(volumeList){
                 var bindsArray = [];
                 for(var index in volumeList){
                     var volume = volumeList[index];
                     var item = [volume.volumeHost, volume.volumeDest].join(':');
                     bindsArray.push(item);
                 }
                 return bindsArray;
             }
            function getEnvFormat(envList){
                var env = [];
                for(var index in envList){
                    var item = [envList[index].envKey, envList[index].envValue].join('=');
                    env.push(item);
                }
                return env;
            }
            function getLinkFormat(linkList){
                var links = [];
                for(var index in linkList){
                    linkList[index].alias = linkList[index].alias ? linkList[index].alias : linkList[index].name;
                    var item = [linkList[index].name, linkList[index].alias].join(':');
                    links.push(item);
                }
                return links;
            }
            function getPortFormat(portList){
                var ports = {};
                for(var index in portList){
                    if(ports[portList[index].containerPort]){
                        ports[portList[index].containerPort].push({'HostPort': portList[index].hostPort});
                    }else{
                        ports[portList[index].containerPort] = [{'HostPort': portList[index].hostPort}];
                    }
                }
                return ports;
            }
            function getExposedPortFormat(portList){
                var ports = {};
                for(var index in portList){
                    ports[portList[index].containerPort] = {};
                }
                return ports;
            }
            function getMemoryFormat(size){
                var unit = size.slice(-1);
                var num = size.slice(0,-1);
                var memory = 0;
                switch(unit){
                    case 'M': return num*1024*1024;
                    case 'G': return num*1024*1024*1024;
                }
            }
            var option = {};

            option.Image = image;
            option.Name = containerName;

            option.Env = getEnvFormat(envList);
            if(option.Env.length === 0){
                delete option.Env;
            }

            option.HostConfig={};
            //CMD
            if($.trim(cmd)){
                option.Cmd = cmd.split(' ');
            }
            //TODO Cpushares含义??
            option.HostConfig.Cpushares = 1;
            option.HostConfig.CpusetCpus = parseInt(containerSize.cpu) == 1 ? "0" : "0,1";
            option.HostConfig.Links = getLinkFormat(linkList);
            if(option.HostConfig.Links.length === 0){
                delete option.HostConfig.Links;
            }
            option.HostConfig.PortBindings = getPortFormat(portList);
            option.ExposedPorts = getExposedPortFormat(portList);
            option.HostConfig.Memory = getMemoryFormat(containerSize.mem);
            option.HostConfig.Binds = getVolumeFormat(volumeList);
            if(option.HostConfig.Binds.length === 0){
                delete option.HostConfig.Binds;
            }
            return option;
        };
        return {
            getPostDataFormat: getPostDataFormat
        };
    });
})();
