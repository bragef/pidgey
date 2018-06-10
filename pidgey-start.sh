#!/bin/bash

source scl_source enable rh-nodejs8 

PIDGEY_PATH=/local/home/nzlbf/pidgey
PIDFILE=/tmp/pidgey.pid

cd ${PIDGEY_PATH} 

stop() {
    PID=`cat $PIDFILE`
     if [[ -f $PIDFILE &&  -e /proc/${PID}  ]]; then 
     	kill -TERM ${PID} 
	sleep 2
	if [  -e /proc/${PID} ]; then
	    kill -KILL ${PID}
        fi
	if [[ -f $PIDFILE ]]; then
	    rm $PIDFILE
	fi
     fi
}



case "$1" in
start)
     nohup node pidgey.js & 
;;
status)
     PID=`cat $PIDFILE`
     if [[ -f $PIDFILE &&  -e /proc/${PID} ]]; then
	 echo "pidgey is running"
     else
	 echo "pidgey is not running"
     fi
;;
restart)
    stop 
    sleep 1 
    nohup node pidgey.js & 
;;
stop)
    stop
;;

esac
    
