
angular.module('starter',['ngResource', 'ngRoute'])


.config(function($routeProvider) {  
    $routeProvider  
    
    .when('/', {  
        templateUrl: 'index.html',  
        controller: 'homepageCtrl'  
    })
    
})
	 

.factory('searchTheBook',function($resource) {
	return $resource('http://localhost:3000/webscrapeservices/searchQuery/:searchText', {searchText:'@searchText'});
})
	   
.controller('homepageCtrl',[ '$scope', '$timeout', 'searchTheBook', function($scope, $timeout, searchTheBook){
	console.log("hiiiii......:D");
	$scope.scrapeData = null;
	
	$scope.searchProd = function(){
		
		searchTheBook.get({searchText : $scope.qString}, function( response){
			console.log(response);
			var myArr = [];
			$scope.numOfSites = Object.keys(response.data).length;
			$scope.scrapeData = response.data;
		});
		
	}
	
}])