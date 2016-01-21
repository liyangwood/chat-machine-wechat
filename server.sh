#!/bin/sh

PORT=7000
PORT1=7001

start(){
    sudo rm -rf nohup.log
    sudo meteor run --port $PORT >nohup.log &
    echo "weixin chat server start success"
}

stop(){
    ps -ef |grep meteor|grep $PORT |awk '{print $2}'|xargs sudo kill -9
    ps -ef |grep meteor|grep $PORT1 |awk '{print $2}'|xargs sudo kill -9
    echo "weixin chat server stopped"
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    *)
        echo $"Usage: $0 {start|stop}"

esac
