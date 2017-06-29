# patterns-api
Node backend for Patterns App

### General structure

The website consists of the following general components:

* activities
* types
* assets
* users

### Routes

#### `routes/auth.js`
Used to set up OAuth login using Google

* `GET OAuth(/google)`
* `POST OAuth (/google/callback)`

#### `routes/activites.js` (loginRequired for all)
Used to get and add activities

* `GET all activities (/users/u_id/activities)` 
* `POST add new activity (/users/u_id/activities)`

#### `routes/assets.js` (loginRequired for all)
Used to CRUD assets (as children of parent assets)

* `GET all child assets of a given asset (/assets/a_id/childassets)`
* `POST add new child asset (/assets/a_id/childassets)`
* `DELETE remove a child (/assets/a_id/childassets/c_id)` - ensureCorrectUser
* `EDIT a child of an asset (/assets/a_id/childassets/c_id)` - ensureCorrectUser

#### `routes/types.js` (loginRequired for all)
Used to CRUD types and top-level assets (i.e., those without parent assets) 

* `GET all types (/types)`
* `POST a new type (/types)`
* `DELETE a type (/types/t_id)` - ensureCorrectUser
* `EDIT a type (/types/t_id)` - ensureCorrectUser
* `GET all assets of a type (/types/t_id/assets)`
* `POST an asset of a given type (/types/t_id/assets)`
* `DELETE an asset of a given type (/types/t_id/assets/a_id)` - ensureCorrectUser
* `EDIT an asset of a given type (/types/t_id/assets/a_id` - ensureCorrectUser


### Tests

#### `test/routes/activitySpec.js`
* 