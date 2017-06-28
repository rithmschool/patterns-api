# patterns-api
Node backend for Patterns App

#### `routes/activites.js`
* `GET all activities (/users/u_id/activities)`
* `POST add new activity (/users/u_id/activities)` - loginRequired, ensureCorrectUser

#### `routes/assets.js`
* `GET all child assets of a given asset (/assets/a_id/childassets)`
* `POST add new child asset (/assets/a_id/childassets)`
* `DELETE remove a child (/assets/a_id/childassets/c_id)`
* `EDIT a child of an asset (/assets/a_id/childassets/c_id)`

#### `routes/types.js`
* `GET all types (/types)`
* `POST a new type (/types)`
* `DELETE a type (/types/t_id)`
* `EDIT a type (/types/t_id)`
* `GET all assets of a type (/types/t_id/assets)`
* `POST an asset of a given type (/types/t_id/assets)`
* `DELETE an asset of a given type (/types/t_id/assets/a_id)`
* `EDIT an asset of a given type (/types/t_id/assets/a_id`