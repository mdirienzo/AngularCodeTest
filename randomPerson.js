// Things to consider in the future. Make the person list state changes focus
// more around the route changes.

angular.module('randomPersonApp', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      controller:'PersonDetailController',
      templateUrl:'blank.html'
    })
    .when('/show/:personId', {
      controller:'PersonDetailController',
      templateUrl:'person-details.html',
    })
    .otherwise({
      redirectTo:'/'
    });
})

// the "back end" service, so to speak
  .service('PeopleList', ['$filter', function($filter) {
    var peopleList = this;
    peopleList.currentIdMarker = 0; // just used for tagging ids
    peopleList.people = [];


        peopleList.getAll = function () {
          return peopleList.people;
        },
        peopleList.getWithId = function (personId) {
          return $filter('filter')(peopleList.people, function (d) {
            return d.id == personId; // FIXME: Problem here with strictly equals.
          })[0];
        },
        peopleList.addPerson = function (person) {
          person.id = peopleList.currentIdMarker;
          peopleList.currentIdMarker++;
          peopleList.people.push(person);
          return person;
        },
        peopleList.deletePerson = function (personId) {
          var index = peopleList.people.indexOf(peopleList.getWithId(personId));
          peopleList.people.splice(index, 1);
        },
        peopleList.saveWithPerson = function (person) {
          // There is most definitely a better (and more automatic) way to do this.
          var index = peopleList.people.indexOf(peopleList.getWithId(person.id));
          peopleList.deletePerson(person.id);
          peopleList.people.splice(index, 0, person);
        }

  }])



  .controller('PersonListController', function($scope, $location, $http, PeopleList) {

    var personListController = this;
    personListController.people = PeopleList.getAll();

    personListController.addPerson = function() {
      // This should perhaps be in it's own controller
      var newPersonDetails = [];
      var fullData = {};

      $http.get('https://randomuser.me/api/').success(function(data) {
        var newPersonData = data.results[0];

        newPersonDetails.push({
          firstName: newPersonData.name.first,
          lastName: newPersonData.name.last,
          phoneNumber: newPersonData.phone,
          email: newPersonData.email,
          imageLoc: newPersonData.picture.large
        });

        var person = PeopleList.addPerson(newPersonDetails[0]);
        $location.path('show/' + person.id);
      });
    };

    personListController.selectPerson = function(personId) {
      $location.path('show/' + personId);
    };
  })






  .controller('PersonDetailController', function($location, $scope, $routeParams, PeopleList) {
    var personDetailController = this;

    var person = PeopleList.getWithId($routeParams.personId);
    personDetailController.person = person;

    // This can be done better.
    if (person) {
      $scope.id = person.id;
      $scope.imageLoc = person.imageLoc;
      $scope.firstNameText = person.firstName;
      $scope.lastNameText = person.lastName;
      $scope.emailText = person.email;
      $scope.phoneNumberText = person.phoneNumber;
    }
    else {
      $location.path('/');
    }

    // This can also be done better.
    personDetailController.save = function () {
      personDetailController.person.id = person.id;
      personDetailController.person.firstName = $scope.firstNameText;
      personDetailController.person.lastName = $scope.lastNameText;
      personDetailController.person.email = $scope.emailText;
      personDetailController.person.phoneNumber = $scope.phoneNumberText;
      console.log(personDetailController.person);
      PeopleList.saveWithPerson(personDetailController.person);
    };

  });
