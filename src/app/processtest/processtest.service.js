(function() {

  'use strict';

  function ProcessTestService(VariablesService)
  {

    var flatprocesses = {};  
    var processor = {};
    var timer;
  	
    var service = {};

    service.initProcessor = function()
    {
        var processes = {};
        processes =  angular.copy(VariablesService.getVariableGroup('processes'));

        processor.counts = {"total":0,"waiting":0,"inprogress":0,"complete":0};
        processor.time = 0;
        processor.active = {};
        processor.complete = {};
        
        service.flattenProcesses(processes,0,'');
        service.setFlattenProcessInputs();
        
        processor.flatprocesses = angular.copy(flatprocesses);
    };

    service.getProcessor = function()
    {
        return processor;
    };

    service.hasWork = function()
    {
        if(processor.counts.waiting > 0 || processor.counts.inprogress > 0)
          return true;

        return false;
    };

    service.doUnitOfWork = function()
    {

        if(Object.keys(processor.active) <= 0)
        {
          return false;
        }

        //for now we'll assume an hour passed is an hour of work completed
        //even though this is not the case in real life
        angular.forEach(processor.active,function(process,key)
        {
          
          if(process.type === 'group')
          {
            
            processor.flatprocesses[key].worked = service.getProcessWorkCount( processor.flatprocesses[key].processes );
          
          } else {

            processor.flatprocesses[key].worked += 1;

          }

        });

    };

    service.advanceStatus = function(status)
    {

        var newStatus;
        switch(status)
        {

            case 'waiting':
                newStatus = 'inprogress';
            break;

            case 'inprogress':
                newStatus = 'complete';
            break;
        }

        return newStatus;

    };

    service.isProcessCompleted = function(process,key)
    {

        /* if we have no outputs to fullfill return true */
        if (Object.keys(process.outputs).length === 0)
            return true;

        var fails = [];
        angular.forEach(process.outputs, function(output, key) 
        {

            if(typeof output !== 'object' || output.length <= 0)
                fails.push(1);

            var passfail = service[key + 'Check'](output);
            
            if(passfail === 'fail')
                fails.push(1);

        });

        return fails.length === 0 ? true : false;

    };

    /* i attempt to advance the process to its next stage */
    service.advanceProcessAttempt = function(process,key)
    {
      
        /* update the status */
        var nextStatus = service.advanceStatus(process.status);

        if(nextStatus === 'inprogress')
        {
            process.status = 'inprogress';
        }
        else if(nextStatus === 'complete')
        {
            var isComplete = service.isProcessCompleted(process,key);

            if(isComplete)
            {
                process.status = 'complete';
                delete processor.active[key];
                processor.complete[key] = process;
            }

        }

    };

    service.advanceProcesses = function()
    {

        angular.forEach(processor.flatprocesses, function(process,key) 
        {

            var isReady = service.isReady(process);
            var isComplete = service.isComplete(process);

            if(isReady && !isComplete)
            {

                /* the process is ready and is not complete yet */
                /* so its an active process */
                processor.active[key] = process;

                /* now we can attempt to advance the process to the next level */
                service.advanceProcessAttempt(process,key);

            }

        });

    };

    service.getProcessWorkCount = function(tree)
    {

        var estimate = 0;

        angular.forEach(tree, function(item, key) 
        {
            if(typeof item.worked === 'number' && item.type === 'process')
                estimate += item.worked;

            if(typeof item.processes === 'object')
            {
                estimate += service.getProcessWorkCount(item.processes);
            }

        });

        return estimate;

    };

    /* a process is ready if its input requirements are fullfilled */
    service.isReady = function(process)
    {

        /* if we have no requirements to fullfill return true */
        if (Object.keys(process.requirements).length === 0)
            return true;

        var fails = [];
        angular.forEach(process.requirements, function(input, key) 
        {
            var passfail = service[key + 'Check'](input);
            if(passfail === 'fail')
                fails.push(1);
        });

        return fails.length === 0 ? true : false;

    };

    service.isComplete = function(process)
    {

        if(typeof processor.complete[process.key] === 'object' )
            return true;

        return false;

    };

    /*
        we need to ensure the process itself is done
        how do we do this? it cant be by the estimate because a process *could* take less time than the estimate and 
        we dont want to encourage Parkinson's law whereby the time a process takes always fills the time it was given
        
        for now lets just say the job is done when the time worked equals the time estimated
   
        @TODO
        make this more like real life
    */
    service.selfCheck = function(item)
    {
        
        var fails = 0;

        item.forEach(function(key) 
        {
            var process = processor.flatprocesses[key];
            var estimatedTime = process.estimate;
            var workedTime = process.worked;

            switch(process.type)
            {
                /*
                case 'group':
                    if we want/need we can compare the sum of the groups process work hours to the sum of the groups estimate
                    this is probably overkill however because we are also checking the processes completed see processesCheck
                break;
                */
                case 'process':
                    if(workedTime < estimatedTime)
                        fails += 1;
                break;
            }
        });

        return fails > 0 ? 'fail' : 'pass';

    };

    //returns false if check fails
    service.processesCheck = function(item)
    {

        //if there are no completed items then fail
        if (Object.keys(processor.complete).length === 0)
            return 'fail';

        //if there are no items then fail
        if(item.length <= 0)
            return 'fail';

        var fails = 0;

        item.forEach(function(key) 
        {
            if(typeof processor.complete[key] === 'undefined')
                fails += 1;
        });

        return fails > 0 ? 'fail' : 'pass';

    };

    service.runProcessor = function()
    {
        //$timeout.cancel(timer);

        service.doUnitOfWork();

        service.advanceProcesses();

    };

    service.runTimer = function(time)
    {

        processor.time = time;

        service.runProcessor();

        //$timeout(function(){
            service.updateCounts();
        //});

        /*
        timer = $timeout(function()
        {

          //service.runTimer(processor.time+1);
        },1000);
        */
    };

    service.flattenProcesses = function(data,depth,parentKey)
    {

        angular.forEach(data, function(process, key) 
        {

            flatprocesses[key] = process;

            var combo = [];

            if(parentKey)
                combo.push(parentKey);

            combo.push(key);

            var comboKey = combo.join('-');

            process.depth = depth;
            process.key = key;
            process.comboKey = comboKey;
            process.status = 'waiting';
            process.predecessors = comboKey.split('-');
            process.worked = 0;
            process.type = 'process';
            process.outputs.self = [key];

            if(typeof process.processes === 'object')
            {

                process.type = 'group';

                if(typeof process.outputs.processes === 'undefined')
                    process.outputs.processes = [];

                process.outputs.processes = service.setProcessGroupOutputs(process.processes);

                process.estimate = service.getProcessGroupEstimate(process.processes);
                service.flattenProcesses(process.processes,depth + 1,comboKey);
            } 

        });

        //console.log(flatprocesses);
    };

    service.setFlattenProcessInputs = function()
    {

        angular.forEach(flatprocesses, function(process, key) 
        {

            process.requirements = angular.copy(process.inputs);

            var processRequirements = service.getAllProcessInputs(process.predecessors);

            if(processRequirements)
            {
                process.requirements.processes = {};
                process.requirements.processes = processRequirements;
            }

        });

    };

    service.getAllProcessInputs = function(processKeys)
    {

        var inputs = [];

        processKeys.forEach(function(key){

            if(typeof flatprocesses[key].inputs.processes === 'object')
            {

                var processInputs = flatprocesses[key].inputs.processes;

                processInputs.forEach(function(inputKey)
                {
                    inputs.push(inputKey);
                });

            }

        });

        return inputs.length > 0 ? inputs : false;
    };


    service.setProcessGroupOutputs = function(tree)
    {

        var processes = [];

        angular.forEach(tree, function(item, key) 
        {
          
            processes.push(key);

            if(typeof item.processes === 'object')
            {
                service.setProcessGroupOutputs(item.processes);
            }

        });

        return processes;

    };

    service.getProcessGroupEstimate = function(tree)
    {

        var estimate = 0;

        angular.forEach(tree, function(item, key) 
        {
            if(typeof item.estimate === 'number')
                estimate += item.units * item.estimate;

            if(typeof item.processes === 'object')
            {
                estimate += service.getProcessGroupEstimate(item.processes);
            }

        });

        return estimate;

    };

    service.updateCounts = function()
    {

        processor.counts.total = 0;
        processor.counts.waiting = 0;
        processor.counts.inprogress = 0;
        processor.counts.complete = 0;

        angular.forEach(processor.flatprocesses, function(process,key) 
        {

            processor.counts.total += 1;

            switch(process.status)
            {
                case 'waiting':
                  processor.counts.waiting += 1;
                break;

                case 'inprogress':
                  processor.counts.inprogress += 1;
                break;

                case 'complete':
                  processor.counts.complete += 1;
                break;
            }

        });

    };

    return service;

  }

  angular.module('app.services.processtest', [])
    .factory('ProcessTestService', ProcessTestService);
  
})();
