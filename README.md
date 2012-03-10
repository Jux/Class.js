# Class.js

Add some class(es) to your JavaScript! 

No, really, if you're not using OOP in JavaScript, you're doing it wrong. Granted, JavaScript doesn't make it easy or straightforward to implement classical inheritance in the language, so that's what this is for! This small utility allows you to:

- Create classes in JavaScript (where JavaScript doesn't actually have a formal notion of a "class"), easily setting up instance properties / methods.
- Singly-inherit from other classes (just like Java, C#, or any other OOP language does), and easily call superclass constructors/methods from overridden constructors/methods in subclasses
- Add mixin classes as a form of multiple inheritance, or the ability to implement interfaces.
- Add static methods which are automatically inherited by subclasses.
- Add a special static method (onClassExtended) which allows for the static initialization of the class itself (much like a static initializer does in Java).

###### \* Note: As much as I preferred to simply leave my blanket statement of "you're doing it wrong" without explanation, a friend of mine asked me to elaborate. So what I mean by this is that without OOP, you are most likely not writing reusable, extensible, maintainable, and testable code (yes, you *should* be writing unit tests for your JavaScript, just like you would with any other language). 


## Creating and Extending a Class

With the traditional example of animals...

```javascript
var Animal = Class( {
	// The class's constructor. The property `constructor` is treated as a special property, which 
	// is the function that is executed when an instance is created
	constructor : function( name ) {
		this.name = name;
	},
	
	// An instance method
	sayHi : function() {
		alert( "Hi, my name is: " + this.name );
	},
	
	// Another instance method
	eat : function() {
		alert( this.name + " is eating" );
	}
} );


var Dog = Animal.extend( {
	constructor : function() {
		// Call the superclass's constructor first
		this._super( arguments );
		
		alert( "Constructing a dog" );
	},

	// Override sayHi method from superclass
	sayHi : function() {
		alert( "Woof! My name is: " + this.name );
	}
} );

var Cat = Animal.extend( {
	constructor : function() {
		// Call superclass's constructor first
		this._super( arguments );
		
		alert( "Constructing a cat" );
	},
	
	// Override sayHi instance method from superclass
	sayHi : function() {
		alert( "Meow! My name is: " + this.name );
	}
} );


var dog1 = new Dog( "Lassie" );
var dog2 = new Dog( "Bolt" );
var cat = new Cat( "Leonardo Di Fishy" );

dog1.sayHi();  // "Woof! My name is: Lassie"
dog2.sayHi();  // "Woof! My name is: Bolt"
cat.sayHi();   // "Meow! My name is: Leonardo Di Fishy"

dog1.eat();  // "Lassie is eating"
dog2.eat();  // "Bolt is eating"
cat.eat();   // "Leonardo Di Fishy is eating"
```

Note that within the class definition, there is a special property which may be defined called `constructor`, which is the actual constructor function for the class. This may be omitted, and a "default constructor" will be used in its place (which is simply an empty function that calls the superclass's constructor).


### Calling superclass methods

Superclass methods can be called easily by using `this._super()`. `this._super()` takes an *array* of arguments to pass to the superclass method. It is done this way because most often, you will simply be passing up the `arguments` object to the superclass method. Ex:

```javascript
var MyClass = Class( {
	constructor : function( a, b, c ) {
		alert( "Constructing MyClass with arguments: " + a + " " + b + " " + c );
	}
} );

var MySubClass = MyClass.extend( {
	constructor : function( a, b, c ) {
		// Call the superclass's constructor
		this._super( arguments );
	}
} );


var instance = new MySubClass( 1, 2, 3 );
```

However, if you want to call the superclass method with specific arguments, simply pass them in an array. Ex:

```javascript
var MyClass = Class( {
	myMethod : function( a, b, c ) {
		for( var i = 0, len = arguments.length; i < len; i++ ) {
			alert( "Superclass myMethod received arg: " + arguments[ i ] );
		}
	}
} );

var MySubClass = MyClass.extend( {
	myMethod : function( a, b, c, d ) {
		// The subclass accepts an extra argument, d, which we don't want to pass to the superclass's myMethod in this case
		this._super( [ a, b, c ] );
		
		// Handle d
		alert( "subclass myMethod handled d (arg 4) as: " + d );
	}
} );


var instance = new MySubClass();
instance.myMethod( 1, 2, 3, 4 );
```


### Using Class.js to extend classes from other frameworks

Because this implementation does not rely on making `Class` the superclass of all classes, Class.js can also be used to extend classes from other frameworks (if those classes rely on prototype-chained inheritance behind the scenes, as Class.js does), to be able to add Class.js features (mixins, inherited static properties, etc) to new subclasses of another hierarchy. Ex:

```javascript
var MySubClass = Class.extend( SomeOtherFrameworksClass, {
	mixins : [ SomeMixinClass ],
	
	inheritedStatics : {
		someInheritedStaticMethod : function() {}
	},
	
	
	constructor : function() {
		// Call our mixin's constructor before calling the superclass's constructor
		SomeMixinClass.call( this );  // Call the constructor function with this object as the context
		
		this._super( arguments );
	}
	
	
	anExtraInstanceMethod : function() {}	
} );
```



## Static and Inherited Static Properties/Methods

Class.js allows you to define static methods within the class definition itself (which makes for easier to read / understand code over some other inheritance implementations, which force you to add static methods only after your subclass has been defined). 

There are two ways to define static methods/properties: 

1. As a static method/property of only the class itself (using `statics`), and 
2. As a static method/property that is inherited to subclasses as well (using `inheritedStatics`) \*

###### \* Note that properties that are *primitives* (i.e. strings, numbers, and booleans) cannot be simply "inherited" (shared) by subclasses as the same property from the superclass. Because of their nature in JavaScript, these properties are *copied* to subclasses, not shared by them. Keep this in mind when creating static methods that use static properties, to always reference the "shared" static properties from the correct superclass (i.e. the superclass that defined them); not a subclass.

Ex:

```javascript
var Animal = Class( {
	
	// static properties/methods that will be applied to to the Animal class *only* (not subclasses)
	statics : {
		
		// A static factory method for the Animal class. This static method
		// will not be inherited into subclasses
		createByType : function( type, animalName ) {
			if( type === 'dog' ) {
				return new Dog( animalName );
			} else if( type === 'cat' ) {
				return new Cat( animalName );
			} else {
				throw new Error( "Unknown Animal type '" + type + "'" );				
			}
		}
	},
	
	
	// static properties/methods that will be included in all subclasses of this class as well
	inheritedStatics : {
		
		// A pretend method that loads a given animal / cat / dog by id from a server
		load : function( animalId ) {
			// For example purposes, assume some synchronous ajax request is made here for data (although
			// you should never *really* use a synchronous ajax request; use an asynchronous one instead and
			// have your users provide a callback function)
			var data = { animalName: "Kitty Kitty Woof Woof" };

			// Note: the `this` reference inside of a static method refers to the class / subclass
			// that the method is being called from. If called from Cat, `this` refers to Cat. If 
			// called from Dog, `this` refers to Dog.
			return new this( data.animalName );
		}
		
	},
	
	
	// ---------------------
	
	// Constructor and instance methods
	
	
	constructor : function( name ) {
		this.name = name;
	},
	
	sayHi : function() {
		alert( "Hi, my name is: " + this.name );
	}
} );


// Concrete classes (which simply use the definition of the Animal class, and inherit the static 'load' method)
var Cat = Animal.extend( {} );
var Dog = Animal.extend( {} );


// ---------------------------------------


// Use of the static method that exists only on the Animal class (not subclasses)
var myCat = Animal.createByType( 'cat', "Milo" );   // instantiate a Cat object using the static factory method
console.log( myCat instanceof Cat );     // true

// Use of static method that is inherited by subclasses
var firstCat = Cat.load( 1 );  // load the "first cat" from our "server". Instantiates a Cat object
var firstDog = Dog.load( 1 );  // load the "first dog" from our "server". Instantiates a Dog object

console.log( firstCat instanceof Cat );  // true
console.log( firstDog instanceof Dog );  // true

```


## Adding Mixins

Although I recommend that you keep multiple inheritance to a minimum (as it increases complexity -- use composition as much as possible instead), there are a few cases where you do want to share some code where that code wouldn't make sense to be a part of your normal inheritance hierarchy (as a base class). But also, mixins allows you to implement interfaces as well.

An example of implementing an interface:

```javascript
// The interface
var List = Class( {
	add    : function() { throw new Error( "add() must be implemented in subclass" ); },
	remove : function() { throw new Error( "remove() must be implemented in subclass" ); } 
} );


// A class implementing the interface
var CoolList = Class( {
	mixins : [ List ],  // "implements" List
	
	constructor : function() {
		this.items = [];
	},
	
	add : function( item ) {
		this.items.push( item );
	}
	
	// Whoops! I forgot to implement remove() !
} );


var myList = new CoolList();
myList.add( "item1" );     // succeeds
myList.remove( "item1" );  // ERROR: "remove() must be implemented in subclass"
```


Our interface could have been implemented using a generalized "abstract" function as well:

```javascript
var abstractFn = function() { throw new Error( "method must be implemented in subclass" ); }

// The interface
var List = Class( {
	add    : abstractFn,
	remove : abstractFn 
} );
```


An example of using a mixin with actual functionality:

```javascript
// A mixin that can add very simple events functionality to a class (if anyone wants this for real real, I'll make a github for it)
var Observable = Class( {
	
	constructor : function() {
		this.events = {};
	},
	
	
	addListener : function( eventName, fn, scope ) {
		if( !this.events[ eventName ] ) {
			this.events[ eventName ] = [];  // create an array for the listeners
		}
		
		var listener = {
			fn: fn, 
			scope: scope || window   // default to firing events in the window scope, if the scope arg is not provided
		};
		this.events[ eventName ].push( listener );
	},
	
	
	removeListener : function( eventName, fn, scope ) {
		var listeners = this.events[ eventName ],
		    i, len;
		
		// No subscribers, simply return
		if( !listeners || listeners.length === 0 ) {
			return;
		}
		
		scope = scope || window;
		for( i = 0, len = listeners.length; i < len; i++ ) {
			if( listeners[ i ].fn === fn && listeners[ i ].scope === scope ) {
				listeners.splice( i, 1 );  // remove the listener entry
				break;
			}
		}
	},
	
	
	fireEvent : function( eventName /* all other args are provided to the listeners' handler functions */ ) {
		var listeners = this.events[ eventName ],
		    i, len;
		
		// No subscribed listeners, simply return
		if( !listeners || listeners.length === 0 ) {
			return;
		}
		
		var eventArgs = Array.prototype.slice.call( arguments, 1 );  // grab all args provided to fireEvent except the event name, to provide to handlers
		for( i = 0, len = listeners.length; i < len; i++ ) {
			listeners[ i ].fn.apply( listeners[ i ].scope, eventArgs );
		}
	}
	
} );


// A class that uses the mixin
var Duck = Class( {
	
	mixins : [ Observable ],
	
	constructor : function( name ) {
		// Don't forget to call the mixin's constructor for proper initialization!
		// Unfortunately, this has to be done by directly using the mixin class's constructor function, setting the proper context object (this)
		Observable.call( this );
		
		this.name = name;
	},
	
	quack : function() {
		this.fireEvent( 'quack', this );  // provide this Duck object with the event
	},
	
	getName : function() {
		return this.name;
	}
	
} );


var duck = new Duck( "Milo" );

// Observe the duck's quacking
duck.addListener( 'quack', function( duck ) {
	alert( "The duck '" + duck.getName() + "' has quacked." );
} );

duck.quack();   // will trigger (fire) the event
```

Notice how `Duck` inherited the methods from the mixin. However, if the class that is being created already defines a method that the mixin also defines,
the **class's method overrides it**. In this case, you must manually call the mixin's method, if you want it to be called (i.e. you wanted to "extend" the mixin's method, not completely *override* it with your new class's definition). Following from the example from above:

```javascript
var Duck = Class( {
	mixins : [ Observable ],
	
	constructor : function( name ) {
		// Don't forget to call the mixin's constructor!
		Observable.call( this );
		
		this.name = name;
	},
	
	quack : function() {
		this.fireEvent( 'quack', this );  // provide this Duck object with the event
	},
	
	// Override fireEvent (for whatever reason...), calling the mixin's fireEvent at the end
	fireEvent : function() {
		alert( "just a note: fireEvent() has been called!" );
		
		// Call the method from the mixin now.
		// Instance methods are located on the prototype (as with any prototype chained implementation), and we must
		// call it in the correct scope (`this`).
		Observable.prototype.fireEvent.apply( this, arguments );
	}
	
} );
```

One last note: if the class includes multiple mixins that all define the same property/method, the mixins defined later in the `mixins` array take precedence (as would happen with multiple inheritance in C++).


## onClassExtended

This is a special method that may be defined under the `statics` or `inheritedStatics` section, which is executed when the class is finished being created (i.e. its inheritance chain has been set up, its mixins have been set up, etc). This can be used as a static initializer for the class, which you may use to set up the class itself (if there is anything to do at this time). Although rarely used, it is very useful for setting up static properties for an entire hierarchy of subclasses (when the `onClassExtended` method exists under `inheritedStatics`).

As a very simple example, we could assign a unique id for each *class* itself (not instances) in an inheritance heirarchy, including the class that
it was originally defined on.

```javascript
var counter = 0;


var MyBaseClass = Class( {

	inheritedStatics : {
		onClassExtended : function( newClass ) {
			// newClass is the class that was just created. We can't yet reference it as MyClass 
			// until the Class() function returns. It will also apply to subclasses as well.
			
			// Attach a static, unique id to each class/subclass
			newClass.uniqueId = ++counter;  // `counter` defined above
		}
	}
	
} );


// empty subclass definition, but onClassExtended() still executes after it is created
// because it was defined under the `inheritedStatics` section
var MySubClass = MyBaseClass.extend( {} );  

alert( MyBaseClass.uniqueId ); // alerts: 1
alert( MySubClass.uniqueId );  // alerts: 2
```




## Changelog:

### 0.1.3.1

* Implemented workaround for `this._super()` calling method in constructor functions for Internet Explorer. Apparently a property named `constructor` is not enumerable using a for-in loop in IE...

### 0.1.3

* Added the ability to call the superclass method simply by using this._super(). 

### 0.1.2

* Added ability to include a special static (or inherited static) onClassExtended() method, which is passed the new class
  that is being created, and allows for subclass-specific initialization (such as to provide the same functionality as a 
  static initializer in Java). 

### 0.1.1

* Fix to allow superclass constructors to return an object other than the usual `this` object.

### 0.1.0

* Initial implementation
