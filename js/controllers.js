angular.module('DuckieTV.controllers',['DuckieTV.utorrent'])


/**
 * Main controller: Kicks in favorites display
 */
.controller('MainCtrl', 
  function($scope, $rootScope, uTorrent) {
  	 $scope.ports = [];
     $scope.statusLog = [];
     $scope.session = false;
     $scope.authToken = localStorage.getItem('utorrent.token')
     uTorrent.setPort(localStorage.getItem('utorrent.port'));
     $scope.rpc = null;
     /**
      * A btapp api runs on one of these ports
      */
    function get_port(i) {
        return 7 * Math.pow(i, 3) + 3 * Math.pow(i, 2) + 5 * i + 10000;
    }

    /**
     * Execute a portscan on any of the 20 ports that are generated by the get_port api until one works.
     * If it works, store it in uTorrent.port
     */
    $scope.Scan = function() {
      var ports = [];
      for(var i =0; i<20; i++) {
        ports.push(get_port(i));
      }
      uTorrent.portScan(ports).then(function(result) {
        $scope.statusLog.push('Ping result on port', result.port);
        $scope.statusLog.push(angular.toJson(result.version, true))
        console.log("Ping result on port", result);
        localStorage.setItem('utorrent.port', result.port);
      
        uTorrent.setPort(result.port);
      }, function(err) {
        console.error('Could not connect to one of the ports!');
      })
    }

    /**
     * Connect with an auth token obtained by the Pair function.
     * Store the resulting session key in $scope.session
     */
    $scope.Connect = function() {
      uTorrent.connect($scope.authToken).then(function(result) {
        $scope.statusLog.push('Connected with authToken '+$scope.authToken+' to session '+result.session);
        $scope.session = result.session;
      });
    }

    /**
     * Execute a pair promise against utorrent
     * It waits 30 seconds for the promise to timeout.
     * When it works, it stores the returned auth token for connecting with the Connect function
     */
    $scope.Pair = function() {
       uTorrent.pair().then(function(result) {
        console.log("Received auth token!", result);
        localStorage.setItem('utorrent.token', result);
        $scope.authToken = result;
       }, function(err) {
        console.error("Eror pairing!", err);
       })
    }

    /**
     * Start the status update polling.
     * Stores the resulting TorrentClient service in $scope.rpc
     * Starts polling every 1s.
     */
    $scope.Update = function() {
      uTorrent.statusQuery().then(function(result) {
        if(!$scope.rpc) {
          $scope.rpc = result;
        }
        setTimeout($scope.Update,1000);
      })
    }

    
  	
  
})
