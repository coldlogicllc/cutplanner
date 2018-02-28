var paatPlannerApp = angular.module('paatPlannerApp', ['ngRoute', 'ngAnimate']);

paatPlannerApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    
    //$locationProvider.html5Mode(true);
        
    $routeProvider
        .when('/home', {
            templateUrl: 'views/home.html',
            controller: 'paatSchedulerController'
        })
        .otherwise({
            redirectTo: '/home'
        });
}]);

paatPlannerApp.controller('paatSchedulerController', ['$scope', '$http', '$window', function($scope, $http, $window){
    
    $scope.maxDayHeight = 500;          /* Total height in pixels for schedule */
    $scope.maxDailyWorkUnits = 1270;    /* Total number of Work Units for a given day */
    
    $scope.selectGroup = function(group){
        $scope.id = group.groupnbr;
        $scope.name = group.types;
        $scope.color = "#0000ff";
        $scope.controldate = group.earliest_due_date;
        $scope.orders = group.orders;
        $scope.manus = group.manus;
        $scope.work_units = group.work_units;
        $scope.pseudo = group.pseudo;
        $scope.fabrics = group.fabrics;
        $scope.closed = group.closed;
        
    };
    
    $scope.saveChanges = function(){
        // TODO: Need to post changes back to server passing JSON.
    };
    
    $scope.drawManus = function(group){
        // TODO: need to build manu's to display different color vertical bars.
    };
    
    $http.get('data/test.json').then(function(response){
        $scope.order = 'when_to_do.when_planned_done';
        $scope.dataPlans = response.data;
    });
         
}]);

