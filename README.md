# Alpinejs Table

Alpinejs Table is a Laravel package to inject a simple table view component into any Laravel project.

Built with [Laravel](https://laravel.com/), [Alpine.js](https://github.com/alpinejs/alpine), [Moment.js](https://momentjs.com/), [@bevacqua/rome](https://github.com/bevacqua/rome), and [Tailwind CSS](https://tailwindcss.com/) .

### Main Features:

- Sorting rows by cell values (ascending & descending)
- Filtering data by text match or dropdown
- Filtering by date picker (if cell value is date format)
- Customizable pagination, header title, and cell values

### Jump to:

- [Dependencies](#dependencies)
- [Installation](#installation)
    1. [Via Composer](#installation-via-composer)
    2. [Manual Installation](#installation-manual)
- [Basic Usage (bundled)](#basic-usage-bundled)
- [Basic Usage (standalone)](#basic-usage-standalone)
- [Integration with your own js/css](#integration-with-your-own)
- [Built-in Filters](#built-in-filter)
    1. [Text Filter](#built-in-filter-text)
    2. [Dropdown Filter](#built-in-filter-dropdown)
    3. [Date Filter](#built-in-filter-date)
- [Customization](#customization)
    1. [Customize Cell Width](#customization-cell-width)
    2. [Customize Pagination](#customization-pagination)
    3. [Customize Header Titles](#customization-header-titles)
    4. [Customize Cell Content](#customization-cell-content)
- [Extra Options:](#extra-options)
    1. [notVisible](#extra-options-not-visible)
    2. [notSortable](#extra-options-not-sortable)
    3. [notFilterable](#extra-options-not-filterable)
- [Appendix](#appendix)
    1. [Option Parameters](#appendix-parameters)
- [Notes](#note)
- [Contributors](#contributors)
- [License](#license)
- [Support](#ttt)
<br />

---

<br />
# <a id='dependencies'></a> Dependencies

**Recommended:**

- Laravel 5.7 or newer (which supports `ServiceProvider::loadViewsFrom()` )
- PHP 7.1 or newer

You can use this package in older versions of Laravel, but extra installation steps are required (as demonstrated below).
<br />

---

<br />

<a id='installation'></a>

# Installation

<a id='installation-via-composer'></a>

## 1. Via composer

```bash
composer require tttstudios/alpinejs-table
```
<a id='installation-manual'></a>

## 2. Manual Installation

### For Laravel ≥ 5.7

1) Unzip the code and put it under `your-repo/packages/tttstudios/` folder, so it looks like this:

```
├── your-repo
│   ├── app
│   ├── config
│   ├── composer.json
│   ├── vendor
│   └── packages
│       └── tttstudios
│           └── alpinejs-table
```

2) Add one line to `your-repo/composer.json`:

```json
"autoload": {
		//...
    "psr-4": {
        //....
        "Tttstudios\\AlpinejsTable\\": "packages/tttstudios/alpinejs-table/src/"
    },
}
```

3) Then, add one line to `your-repo/config/app.php`:

```php
'providers' => [
			//...
			Tttstudios\AlpinejsTable\Providers\AlpinejsTableServiceProvider::class
]
```

4) Lastly, refresh composer's autoload file by running:

```bash
composer dump-autoload
```

### For Laravel  < 5.7:

1) Copy all the source files under `alpinejs-table/resources/views` to your own repo's `views/alpinejs-table` folder.

2) Use Laravel Blade's `@include()` syntax to use them in view files. See [examples](#blade-call-include) below.
<br />

---

<br />

<a id='basic-usage-bundled'></a>

# Basic Usage (Bundle)

Alpinejs Table is shipped with 3 [Blade Aliases](https://laravel.com/docs/7.x/blade#including-subviews):

|Blade Alias               |Description|
|--------------------------|-----------|
| `AlpinejsTableBundle`    | import a bundled javascript file with all its dependencies (including [Alpine.js](https://github.com/alpinejs/alpine) )|
| `AlpinejsTableHtml`      | import a blade view file|
| `AlpinejsTableCss`       | import all styles required by the table|


### For Laravel  ≥ 5.7

You can use Alpinejs Table out of the box. Simply pass an array to  AlpineHtml()'s `collection`  in any blade view.

1) Format data into an array:

```php
// ExampleController.php:

public function index() {

	$users=\App\User::get()->map(function ($user) {
        return [
            'status' => $user->status,
            'name'   => $user->name,
            'email'  => $user->email,
					];
    })->all();
	
	return view('example', compact('users'));
}
```

2) Pass array to blade view:

```html
<!-- in example.blade.php -->

<!--Import styles-->
<style> @AlpinejsTableCss() </style>

<!--Import js scripts-->
<script> @AlpinejsTableBundle() </script>

<!--Import table html-->
@AlpinejsTableHtml(['collection' => $users])

```

And this is what you get:

![2020-06-17_16.58.57.gif](https://github.com/haoluo-ttt/img-hosting/blob/master/emv-docs/2020-06-17_16.58.57.gif?raw=true)

### For Laravel  < 5.7

<a id='blade-call-include'></a>

Prerequisite: Copy all the files under  `alpinejs-table/resources/views` to your own repo's `views/alpinejs-table` folder.

```html
# in example.blade.php:

<style> @include('alpinejs-table.css') </style>

<script> @include('alpinejs-table.js-bundle') </script>

@include('alpinejs-table.html', ['collection' => $users])
```
<br />

---

<br />

<a id='basic-usage-standalone'></a>

# Basic Usage (standalone)

If your app already has  [Alpine.js](https://github.com/alpinejs/alpine) imported, then you don't need to import the bundled javascript file. Instead, you can call `AlpineJsTableCore` . Example:

```html
# in example.blade.php:

<style> @AlpinejsTableCss() </style>

<!-- Without importing Alpine.js: -->
<script> @AlpinejsTableCore() </script>

@AlpinejsTableHtml(['collection' => $users])

```

### For Laravel  < 5.7

```html
# in example.blade.php:

<style> @include('alpinejs-table.css') </style>

<!-- Without importing Alpine.js: -->
<script> @include('alpinejs-table.js-core') </script>

@include('alpinejs-table.html', ['collection' => $users])
```
<br />

---

<br />

<a id='integration-with-your-own'></a>

# Integration with your own js/css

You can tell that Alpinejs Table is using [moment.js](https://momentjs.com/) to parse date & time, and use [Tailwind CSS](https://tailwindcss.com/)  to compose styles. If your app has imported them in global scope, or if you want to integrate Alpinejs Table's source code into your app's bundled js & css, simple follow these steps (Laravel ≥5.7 only):

1) Publish Alpinejs Table's assets by running:

```bash
php artisan vendor:publish --tag=alpinejs-table
```

2) The command above will copy these files into your repo:

```bash
# js:
/resources/js/plugins/rome-modified.js
/resources/js/plugins/alpinejs-table.js

# css:
/resources/sass/plugins/alpinejs-table.scss
```

3) Then you can import Alpinejs Table's core js into your own `app.js` :

```jsx
// Source File: /resources/js/app.js

import 'alpinejs';

import AlpinejsTablePlugin from './plugins/alpinejs-table.js'

// Make it accessible in global ssope:
window.AlpinejsTablePlugin = AlpinejsTablePlugin;
```

4) And you can import Alpinejs Table's styles into your own `app.scss` :

```scss
/* Source File: /resources/sass/app.scss */

@tailwind base;

@tailwind components;

@import 'plugins/alpinejs-table';

@tailwind utilities;
```

5) Lastly, you only need to import `AlpinejsTableHtml` alone:

```html
<!-- in example.blade.php -->

@AlpinejsTableHtml(['collection' => $users, 'options'=>$options])

```
<br />

---

<br />

<a id='built-in-filter'></a>

# Built-in Filters

<a id='built-in-filter-text'></a>

## 1. Text Filter

Alpinejs Table generates a text filter for each column by default, which means, all columns can be filtered by text matching out of the box, unless you intentionally [disable it](#extra-options-not-filterable).

![2020-06-24_13.59.26.gif](https://github.com/haoluo-ttt/img-hosting/blob/master/emv-docs/2020-06-24_13.59.26.gif?raw=true)

<a id='built-in-filter-dropdown'></a>

## 2. Dropdown Filter

For limited data types, you may need a dropdown filter. For example: `status` may only have 2 valid values: `Active` or `Pending` . In this case, you can set it as a dropdown filter.

**Example:**

1) Format data into an array:

```php
// ExampleController.php:

public function index() {

	$users=\App\User::get()->map(function ($user) {
        return [
            'status' => $user->status,
            'name'   => $user->name,
            'email'  => $user->email,
					];
    })->all();
	
		$options=[
         'dropdowns' => ['status'],
    ];

	return view('example', compact('users', 'options'));
}
```

2) Pass array to blade view:

```html
<!-- in example.blade.php -->

<style> @AlpinejsTableCss() </style>

<script> @AlpinejsTableBundle() </script>

@AlpinejsTableHtml(['collection' => $users, 'options' => $options])

```

And this is what you'll get:

![Untitled.png](https://github.com/haoluo-ttt/img-hosting/blob/master/emv-docs/Untitled.png?raw=true)

<a id='built-in-filter-date'></a>

## 3. Date Filter

If some column is in date format. You may find it useful to define `dates` in options. 

**Example:**

```php
// ExampleController.php:

public function index() {

	$users=\App\User::get()->map(function ($user) {
        return [
            'status' => $user->status, // "Active" or "Pending"
            'name'   => $user->name,
						// must be in ISO 8601 format, e.g.: 2020-05-27T18:26:58+00:00
            'birthday'  => $user->birthday->toIso8601String()
					];
     })->all();
	
	$options=[
         'dropdowns' => ['status'],
         'dates' => ['birthday'],
    ];

	return view('example', compact('users', 'options'));
}
```

Voila! The birthday column turns into a date picker automatically. Thank  [@bevacqua/rome](https://github.com/bevacqua/rome)  for this great date picker plugin. 

![2020-06-16_18.37.29.gif](https://github.com/haoluo-ttt/img-hosting/blob/master/emv-docs/2020-06-16_18.37.29.gif?raw=true)

You can even set your own date format:

```php
$options=[
    'dates' => ['birthday'],
	'dateFormat' => 'YYYY/M/D',
  ];
```

![2020-06-17_15.25.34.gif](https://github.com/haoluo-ttt/img-hosting/blob/master/emv-docs/2020-06-17_15.25.34.gif?raw=true)
<br />

---

<br />

<a id='customization'></a>

# Customizations

<a id='customization-cell-width'></a>

## 1. Customize Cell Width

Alpinejs Table has a default cell width of `200px` for each column. You may customize the width of each cell by passing a javascript closure to `cellWidth(key)`

**Example:**

```php
$options=[
		// make sure the syntax is for Javascript:

		'cellWidth(key)'=>' 

        if(key=="status")
            return `120px`;

        if(key=="email")
            return `400px`;

        return `200px`;
    ',
];
```

Refresh the page and you can get the new layout:

![Untitled%201.png](https://github.com/haoluo-ttt/img-hosting/blob/master/emv-docs/Untitled%201.png?raw=true)

<a id='1-customize-pagination'></a>

## 2. Customize Pagination

Alpinejs Table displays 10 entries per page by default. You can easily override it by setting `perPage`  in `options`:

**Example:**

```php
$options=[
    'perPage' => 24
];
```

You can also set the options to allow visitors on change perPage on the fly:

```php
$options=[
    'perPageOptions' => [24, 48, 96]
];
```

Then You can see the settings in effect in bottom right of the table:

![2020-06-16_18.54.55.gif](https://github.com/haoluo-ttt/img-hosting/blob/master/emv-docs/2020-06-16_18.54.55.gif?raw=true)
<br />

---

<br />

<a id='customization-header-titles'></a>

## 3. Customize Header Titles

By default, Alpinejs Table transforms `key` into title case and display in header. For example: `user_email`  will be transformed into `User Email`.

In case you need to customize the title, you can use `titleRenderer(key)` :

**Example:**

```php
// ExampleController.php:
		
	$options=[
		'titleRenderer(key)'=>'
	        if(key=="id")
	            return `User ID`;

			// by default: return nothing
	    '
	];

```

**Result:**

![Untitled%202.png](https://github.com/haoluo-ttt/img-hosting/blob/master/emv-docs/Untitled%202.png?raw=true)
<br />

---

<br />

<a id='customization-cell-content'></a>

## 4. Customize Cell Content

Sometimes you need to display a transformed content for some cells. For example, you may want to show red font color for users with "Pending" status, or even add different action buttons for different cells . 

Here comes the magic of `cellRenderer(key,cell,row)` :

**Example:**

```php
// ExampleController.php:

public function index() {

	$users=\App\User::get()->map(function ($user) {
        return [
			'id'     => $user->id,
            'status' => $user->status,
            'name'   => $user->name,
            'email'  => $user->email,
		];
     })->all();
	
		
	$options=[
		'cellRenderer(key,cell,row)'=>'

	        if(key == "status" && cell.value == "Pending")
	            return `<span style="color:red">` + cell.value + `</span>`;

	        if(key == "name")
	        {
	        	const isPending = row.status.value == "Pending";
				return cell.value 
						+ `<a class="`+(isPending ? "btn-dark" : "btn-green") + ` float-right" href="/users/` + row.id.value + `">`
								+ (isPending ? "Approve" : "Details")
						+`</a> `;
	        }

	        return cell.value; // default
	    '
	];

	return view('example', compact('users', 'options'));
}

```

**Result:**

![Untitled%203.png](https://github.com/haoluo-ttt/img-hosting/blob/master/emv-docs/Untitled%203.png?raw=true)
<br />

---

<br />

<a id='extra-options'></a>

# Extra Options

<a id='extra-options-not-visible'></a>

## 1. notVisible:

The column will not be displayed, but its value can still be accessed by `row` in closures. 

**Example:**

```php
// ExampleController.php:
		
	$options=[
		'notVisible' => ['id']
		'cellRenderer(key,cell,row)'=>'
	        if(key=="name")
	            return `<b style="color:blue">ID #`
	            		+ row.id.value 
	            		+ "</b>: "
	            		+ cell.value;
	        return cell.value;
	    '
	];

```

**Result:**

![Untitled%204.png](https://github.com/haoluo-ttt/img-hosting/blob/master/emv-docs/Untitled%204.png?raw=true)

## <a id='extra-options-not-sortable'></a> 2. notSortable:

The column can not be sorted, but its value can still be accessed by `row` in closures. 

**Example:**

```php
// ExampleController.php:
		
	$options=[
		'notSortable' => ['email']
	];

```

**Result:**

![Pasted_Image_2020-06-17__4_25_PM.png](https://github.com/haoluo-ttt/img-hosting/blob/master/emv-docs/Pasted_Image_2020-06-17__4_25_PM.png?raw=true)

## <a id='extra-options-not-filterable'></a> 3. notFilterable:

The column can not be filtered by text or dropdown, but its value can still be accessed by `row` in closures. 

**Example:**

```php
// ExampleController.php:
		
	$options=[
		'notFilterable' => ['email']
	];

```

**Result:**

![Pasted_Image_2020-06-17__4_29_PM.png](https://github.com/haoluo-ttt/img-hosting/blob/master/emv-docs/Pasted_Image_2020-06-17__4_29_PM.png?raw=true)
<br />

---

<br />
# <a id='appendix'></a> Appendix

## <a id='appendix-parameters'></a> Option Parameters

|Parameter                 |type      |Example Value                       |Description                            |
|--------------------------|----------|------------------------------------|---------------------------------------|
|dropdowns                 |array     |['status']                          |Set dropdown filter to a column        |
|dates                     |array     |['birthday']                        |Set date filter to a column            |
|dateFormat                |string    |'YYYY/M/D'                          |Set date format to a date filter       |
|perPage                   |integer   |24                                  |Set "per page" for pagination          |
|perPageOptions            |array     |[24, 48, 96]                        |Set perPage options for pagination     |
|notVisible                |array     |['id', 'password']                  |Hide columns from showing in table     |
|notSortable               |array     |['email']                           |Hide sort button from columns          |
|notFilterable             |array     |['action']                          |Hide filter from columns               |
|cellWidth(key)            |js closure|'return \`200px\`; '                |Customize cell width for any column    |
|titleRenderer(key)        |js closure|'if(key=="id") return \`User ID\`; '|Customize title width for column header|
|cellRenderer(key,cell,row)|js closure|'return cell.value; '               |Customize cell content                 |


<br />

---

<br />
# <a id='notes'></a> Notes

Alpinejs Table load all data into a single javascript instance. Performance can be compromised if there are too many data. 
<br />

---

<br />
# <a id='license'></a> License

Alpinejs Table is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
<br />

---

<br />
# <a id='contributors'></a> Contributors

[@haoluo-ttt](https://github.com/haoluo-ttt)

[@fpena](https://github.com/fpena)

<br />

---

<br />
# <a id='ttt'></a> Premium Support By TTT Studios

Alpinjs Table is presented by the web developing team at TTT Studios. We are a Digital Innovation Studio based out of Vancouver, Canada, delivering custom software and solutions that are designed and developed 100% in-house. The technologies we work with include AR & VR, IoT, AI, security & encryption, and cloud computing.

![ttt-logo.png](https://github.com/haoluo-ttt/img-hosting/blob/master/emv-docs/ttt-logo.png?raw=true)