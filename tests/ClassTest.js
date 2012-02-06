/*global jQuery, Ext, Y, tests, Class */
/*jslint evil:true */
Ext.test.Session.addSuite( {
	
	name: 'Class',
	
	items : [
	
		/**
		 * Test Class() constructor
		 */
		{
			name : "Test Class() constructor",
			
			"The Class() constructor should work as if Class.extend() was called" : function() {
				var constructorCalled = false,
				    methodCalled = false;
				
				var MyClass = Class( {
					constructor : function() { constructorCalled = true; },
					method : function() { methodCalled = true; }
				} );
				
				var instance = new MyClass();
				Y.Assert.isTrue( constructorCalled, "The constructor should have been called by instantiating the class" );
				Y.Assert.areSame( MyClass.prototype.method, instance.method, "The method should exist on the prototype" );
				
				instance.method();
				Y.Assert.isTrue( methodCalled, "The method should have been called from the prototype" );
			},
			
			"The Class() constructor should work as if Class.extend() was called, even with using the `new` keyword to extend the class" : function() {
				var constructorCalled = false,
				    methodCalled = false;
				
				var MyClass = new Class( {
					constructor : function() { constructorCalled = true; },
					method : function() { methodCalled = true; }
				} );
				
				var instance = new MyClass();
				Y.Assert.isTrue( constructorCalled, "The constructor should have been called by instantiating the class" );
				Y.Assert.areSame( MyClass.prototype.method, instance.method, "The method should exist on the prototype" );
				
				instance.method();
				Y.Assert.isTrue( methodCalled, "The method should have been called from the prototype" );
			}
		},
	
	
		/*
		 * Test apply()
		 */
		{
			name : "Test apply()",
			
			
			test_apply: function(){
				var o1 = Class.apply({}, {
					foo: 1,
					bar: 2
				});
				Y.ObjectAssert.hasKeys(o1, {
					foo: 1,
					bar: 2
				}, 'Test simple apply, with a return value');
				
				var o2 = {};
				Class.apply(o2, {
					opt1: 'x',
					opt2: 'y'
				});
				Y.ObjectAssert.hasKeys(o2, {
					opt1: 'x',
					opt2: 'y'
				}, 'Test that the reference is changed');
				
				var o3 = Class.apply({}, {
					prop1: 1
				});
				Y.Assert.isUndefined(o3.prop2, 'Test to ensure no extra properties are copied');
				
				var o4 = Class.apply({
					foo: 1,
					baz: 4
				}, {
					foo: 2,
					bar: 3
				});
				Y.ObjectAssert.hasKeys(o4, {
					foo: 2,
					bar: 3,
					baz: 4
				}, 'Ensure that properties get overwritten by defaults');
				
				var o5 = {};
				Class.apply(o5, {
					foo: 'new',
					exist: true
				}, {
					foo: 'old',
					def: true
				});
				Y.ObjectAssert.hasKeys(o5, {
					foo: 'new',
					def: true,
					exist: true
				}, 'Test using defaults');
				
				var o6 = Class.apply({}, {
					foo: 'foo',
					bar: 'bar'
				}, {
					foo: 'oldFoo',
					bar: 'oldBar'
				});
				Y.ObjectAssert.hasKeys(o6, {
					foo: 'foo',
					bar: 'bar'
				}, 'Test to ensure all defaults get overridden');
				
				Y.Assert.isNull(Class.apply(null, {}), 'Test null first argument');
			}
		},
			
		
		/*
		 * Test applyIf()
		 */
		{
			name : "Test applyIf()",
			
			
			test_applyIf: function(){
				var o1 = Class.applyIf({}, {
					foo: 'foo',
					bar: 'bar'
				});
				Y.ObjectAssert.hasKeys(o1, {
					foo: 'foo',
					bar: 'bar'
				}, 'Test with an empty destination object');
				
				var o2 = Class.applyIf({
					foo: 'foo'
				}, {
					foo: 'oldFoo'
				});
				Y.ObjectAssert.hasKeys(o2, {
					foo: 'foo'
				}, 'Ensure existing properties don\'t get overridden');
				
				var o3 = Class.applyIf({
					foo: 1,
					bar: 2
				}, {
					bar: 3,
					baz: 4
				});
				Y.ObjectAssert.hasKeys(o3, {
					foo: 1,
					bar: 2,
					baz: 4
				}, 'Test mixing properties to be overridden');
				
				var o4 = {};
				Class.applyIf(o4, {
					foo: 2
				}, {
					foo: 1
				});
				Y.ObjectAssert.hasKeys(o4, {
					foo: 2
				}, 'Test that the reference of the object is changed');
				
				Y.Assert.isNull(Class.applyIf(null, {}), 'Test null first argument');
			}
		},
		
		
		/*
		 * Test extend()
		 */
		{
			name: 'Test extend()',
			ttype: 'suite',
			
			items : [
				{
					name : "Test basic extend() functionality (prototype inheritance, constructor reference fixing, superclass reference",
					
					"extend() should set up simple prototype-chaining inheritance" : function() {
						var Dude = Class.extend(Object, {
							constructor: function(config){
								Class.apply(this, config);
								this.isBadass = false;
							}
						});
						var Aweysome = Class.extend(Dude, {
							constructor: function(){
								Aweysome.superclass.constructor.apply(this, arguments);
								this.isBadass = true;
							}
						});
						
						var david = new Aweysome({
							davis: 'isAwesome'
						});
						Y.Assert.areEqual('isAwesome', david.davis, 'Test if David is awesome');
						Y.Assert.isTrue(david.isBadass, 'Test if David is badass');
						Y.Assert.isFunction(david.override, 'Test if extend added the override method');
						Y.ObjectAssert.areEqual({
							isBadass: true,
							davis: 'isAwesome'
						}, david, 'Test if David is badass and awesome');
					},
					
					
					"extend() should not require the first argument, defaulting the first arg to Object (which makes the actual superclass `Function`)" : function() {
						var A = Class.extend( {} );
						Y.Assert.areSame( A.prototype.superclass.constructor, Function, "The subclass should have had Function as its superclass (which is what happens when the first arg is `Object`)" );
					},
					
					
					"extend() should add static 'constructor' property to the class (constructor function)" : function() {
						var A = Class.extend( Object, {} );
						Y.Assert.areSame( A.constructor, A, "static 'constructor' property not added to constructor function that refers to constructor function" );
					},
					
					
					"extend() should add static 'constructor' property to a subclass (constructor function)" : function() {
						var A = Class.extend( Object, {} );
						var B = Class.extend( A, {} );
						Y.Assert.areSame( B.constructor, B, "static 'constructor' property not added to constructor function that refers to constructor function" );
					},
					
					
					"extend() should add static 'superclass' property to a subclass (constructor function) that refers to its superclass prototype" : function() {
						var A = Class.extend( Object, {} );
						var B = Class.extend( A, {} );
						Y.Assert.areSame( B.superclass, A.prototype, "static 'superclass' property not added to constructor function that refers to constructor function" );
					},
					
					
					"extend() should add a static `extend` method to the subclass, which can be used to extend it" : function() {
						var MyClass = Class.extend( {
							method : function() {}
						} );
						
						var MySubClass = MyClass.extend( {} );
						var instance = new MySubClass();
						
						Y.Assert.isFunction( instance.method, "The method should have been inherited to the subclass with the static `extend()` method placed on the superclass constructor" );
					},
					
					
					
					// Test a constructor returning an object other than its normal `this` reference
					
					"if a constructor returns a different object than its `this` reference, that object should be returned when instantiating the class" : function() {
						var MyClass = Class.extend( {
							constructor : function() {
								return { hi: 1 };  // change the object that is returned from the constructor
							}
						} );
						
						var instance = new MyClass();
						Y.Assert.areSame( 1, instance.hi, "The subclass constructor should have returned the overriden return object from its superclass constructor" );
					},
					
					
					"if no explicit constructor is provided, extend() should set up a constructor which returns the value of its superclass's constructor (in case the constructor changes the object that is created)" : function() {
						var MyClass = Class.extend( {
							constructor : function() {
								return { hi: 1 };  // change the object that is returned from the constructor
							}
						} );
						
						var MySubClass = MyClass.extend( {} );
						
						var instance = new MySubClass();
						Y.Assert.areSame( 1, instance.hi, "The subclass constructor should have returned the overriden return object from its superclass constructor" );
					}
				},
			
				
				/* Not yet implemented...
				{
					name : "Test superclass method calling",
					
						
					// Test the this.callSuper() and this.applySuper() functions
					
					"extend() should create this.callSuper() and this.applySuper() methods for subclass constructor functions" : function() {
						var A = Class.extend( Object, {} );
						
						
					},
					
					"extend() should create this.callSuper() and this.applySuper() methods for subclass constructor functions, even if the superclass is not defined using Class.extend()" : function() {
						var A = function(){};
						
					},
					
					"extend() should create this.callSuper() and this.applySuper() methods for subclass methods that have a corresponding superclass method" : function() {
						
					},
					
					"extend() should create this.callSuper() and this.applySuper() methods for subclass methods that have a corresponding superclass method, even if the superclass is not defined using Class.extend()" : function() {
						
					},
					
					"extend() should NOT create this.callSuper() and this.applySuper() methods for subclass methods that do not have a corresponding superclass method" : function() {
						
					}
				}
				*/
				
				
				
				/*
				 * Test extend() statics functionality
				 */
				{
					name: 'Test extend() statics functionality',
					
					"extend() should add static properties defined in `statics`" : function() {
						var MyClass = Class.extend( Object, {
							statics : {
								staticFn1 : function() {},
								staticFn2 : function() {}
							}
						} );
						
						Y.Assert.isFunction( MyClass.staticFn1 );
						Y.Assert.isFunction( MyClass.staticFn2 );
					},
					
					
					"The static properties defined in `statics` should not be inherited to subclasses" : function() {
						var MyClass = Class.extend( Object, {
							statics : {
								staticFn : function() {}
							}
						} );
						var MySubClass = MyClass.extend( {} );
						
						Y.Assert.isFunction( MyClass.staticFn );
						Y.Assert.isUndefined( MySubClass.staticFn );
					}					
				},
				
				
				
				/*
				 * Test extend() inheritedStatics functionality
				 */
				{
					name: 'Test extend() inheritedStatics functionality',
					
					"extend() should add static properties defined in `inheritedStatics`" : function() {
						var MyClass = Class.extend( Object, {
							inheritedStatics : {
								staticFn1 : function() {},
								staticFn2 : function() {}
							}
						} );
						
						Y.Assert.isFunction( MyClass.staticFn1 );
						Y.Assert.isFunction( MyClass.staticFn2 );
					},
					
					
					"The static properties defined in `inheritedStatics` should be inherited to subclasses" : function() {
						var MyClass = Class.extend( Object, {
							inheritedStatics : {
								staticFn : function() {}
							}
						} );
						var MySubClass = MyClass.extend( {} );
						var MySubSubClass = MySubClass.extend( {} );
						var MySubSubSubClass = MySubSubClass.extend( {} );
						
						Y.Assert.isFunction( MyClass.staticFn, "The staticFn should exist on the class it was defined on with `inheritedStatics`" );
						Y.Assert.isFunction( MySubClass.staticFn, "The staticFn should exist on a direct subclass" );
						Y.Assert.isFunction( MySubSubClass.staticFn, "The staticFn should exist on a subclass 2 subclasses down from the class that defined it" );
						Y.Assert.isFunction( MySubSubSubClass.staticFn, "The staticFn should exist on a subclass 3 subclasses down from the class that defined it" );
					},
					
					
					"The static properties defined in `inheritedStatics` should be inherited to subclasses, but not affect superclasses" : function() {
						var MyClass = Class.extend( {} );
						var MySubClass = MyClass.extend( {} );
						var MySubSubClass = MySubClass.extend( {
							inheritedStatics : {
								staticFn : function() {}
							}
						} );
						var MySubSubSubClass = MySubSubClass.extend( {} );
						
						Y.Assert.isUndefined( MyClass.staticFn, "The staticFn should not exist on a far superclass that has a subclass with `inheritableStatics`" );
						Y.Assert.isUndefined( MySubClass.staticFn, "The staticFn should not exist on a direct superclass of a subclass with `inheritableStatics`" );
						Y.Assert.isFunction( MySubSubClass.staticFn, "The staticFn should exist on the subclass that `inheritableStatics` was defined on" );
						Y.Assert.isFunction( MySubSubSubClass.staticFn, "The staticFn should exist on a subclass of the class that defined `inheritableStatics`" );
					},
					
					
					"Redefining an inherited static should take precedence in the subclass over the superclass's static" : function() {
						var method = function() {},
						    subclassMethod = function() {};
						
						var MyClass = Class.extend( {
							inheritedStatics : {
								method : method
							}
						} );
						var MySubClass = MyClass.extend( {
							inheritedStatics : {
								method : subclassMethod
							}
						} );
						
						Y.Assert.areSame( method, MyClass.method, "Initial condition: MyClass should have the original method" );
						Y.Assert.areSame( subclassMethod, MySubClass.method, "MySubClass should have the new method (overriding the superclass static method)" );
					},
					
					
					"Overriding an inherited static with a regular (non-inherited) static should only affect the class that the non-inherited static is defined for" : function() {
						var inheritedMethod = function() {},
						    overrideStaticMethod = function() {};
						
						var MyClass = Class.extend( {
							inheritedStatics : {
								method : inheritedMethod
							}
						} );
						var MySubClass = MyClass.extend( {
							statics : {
								method : overrideStaticMethod  // Note: A non-inherited static
							}
						} );
						var MySubSubClass = MySubClass.extend( {} );
						
						Y.Assert.areSame( inheritedMethod, MyClass.method, "Initial condition: MyClass should have the original inheritedMethod" );
						Y.Assert.areSame( overrideStaticMethod, MySubClass.method, "MySubClass should have the new `static` method (overriding the superclass static method)" );
						Y.Assert.areSame( inheritedMethod, MySubSubClass.method, "MySubSubClass should have the original inheritedMethod (the non-inherited `static` method in its superclass should not have affected this behavior)" );
					}
				},
				
				
				/*
				 * Test extend() mixin functionality
				 */
				{
					name: 'Test extend() mixin functionality',
			
					
					"extend() should be able to add in a single mixin class into another class" : function() {
						var mixinFnExecuted = false; 
						
						var Mixin = Class.extend( Object, {
							mixinFn : function() {
								mixinFnExecuted = true;
							}
						} );
						
						var MyClass = Class.extend( Object, {
							mixins : [ Mixin ]
						} );
						
						
						var instance = new MyClass(); 
						instance.mixinFn();   // execute the function
						Y.Assert.isTrue( mixinFnExecuted, "The mixin function was not properly added to MyClass." );
					},
					
					
					
					"extend() should not overwrite a class's methods/properties with a mixin's methods/properties" : function() {
						var data = null; 
						
						var Mixin = Class.extend( Object, {
							testProp : "Mixin defined",
							testMethod : function() {
								data = "Mixin defined";
							}
						} );
						
						var MyClass = Class.extend( Object, {
							mixins : [ Mixin ],
							
							testProp : "MyClass defined",
							testMethod : function() {
								data = "MyClass defined";
							}
						} );
						
						
						var instance = new MyClass(); 
						Y.Assert.areSame( "MyClass defined", instance.testProp, "The mixin should not overwrite the class's properties" );
						
						instance.testMethod();
						Y.Assert.areSame( "MyClass defined", data, "The mixin's method should not have overwritten the class's method." );
					},
					
					
					
					"extend() should have later-defined mixins take precedence over earlier-defined mixins" : function() {
						var Mixin1 = Class.extend( Object, {
							testProp : "Mixin1 defined"
						} );
						var Mixin2 = Class.extend( Object, {
							testProp : "Mixin2 defined"
						} );
						
						var MyClass = Class.extend( Object, {
							mixins : [ Mixin1, Mixin2 ]
						} );
						
						var instance = new MyClass();
						Y.Assert.areSame( "Mixin2 defined", instance.testProp, "The second mixin's properties/methods should take precedence over the first one's." );
					},
					
					
					// --------------------------------
					
					// Test setting up the hasMixin() method both as a static method, and an instance method
					
					"extend() should have set up the static hasMixin() method, which should check the class for a given mixin" : function() {
						var Mixin = Class.extend( Object, {} );
						var SomeOtherMixin = Class.extend( Object, {} );
						
						var MyClass = Class.extend( Object, {	
							mixins : [ Mixin ]
						} );
						
						Y.Assert.isTrue( MyClass.hasMixin( Mixin ), "MyClass should have the mixin 'Mixin'" );
						Y.Assert.isFalse( MyClass.hasMixin( SomeOtherMixin ), "MyClass should *not* have the mixin 'SomeOtherMixin'" );
					},
					
					
					"extend() should have set up the instance hasMixin() method, which should check an instance for a given mixin" : function() {
						var Mixin = Class.extend( Object, {} );
						var SomeOtherMixin = Class.extend( Object, {} );
						
						var MyClass = Class.extend( Object, {	
							mixins : [ Mixin ]
						} );
						var myInstance = new MyClass();
						
						Y.Assert.isTrue( myInstance.hasMixin( Mixin ), "myInstance should have the mixin 'Mixin'" );
						Y.Assert.isFalse( myInstance.hasMixin( SomeOtherMixin ), "myInstance should *not* have the mixin 'SomeOtherMixin'" );
					}
				},
				
				/*
				 * Test extend() onClassExtended functionality
				 */
				{
					name: 'Test extend() onClassExtended',
					
					
					"onClassExtended(), if it exists as a static, should be executed after all other extend functionality has completed" : function() {
						var onClassExtendedCallCount = 0;
						
						var MyMixin = Class( {
							mixinInstanceMethod : function() {}
						} );
						
						var MyClass = Class( {
							statics : {
								onClassExtended : function( newClass ) {
									onClassExtendedCallCount++;
									
									// ASSERTS CONTINUE HERE
									Y.Assert.isFunction( newClass.someStaticMethod, "someStaticMethod should exist as a static method by this point" );
									Y.Assert.isFunction( newClass.someInheritedStaticMethod, "someInheritedStaticMethod should exist as a static method by this point" );
									Y.Assert.isFunction( newClass.prototype.mixinInstanceMethod, "mixinInstanceMethod should exist as an instance method by this point" );
								},
								
								someStaticMethod : function() {}
							},
							
							inheritedStatics : {
								someInheritedStaticMethod : function() {}
							},
							
							mixins : [ MyMixin ]
						} );
						
						Y.Assert.areSame( 1, onClassExtendedCallCount );  // to make sure the function actually runs
						// NOTE: Asserts continue inside onClassExtended
					},
					
					
					"onClassExtended(), if it exists as an inherited static, should be executed for all subclasses" : function() {
						var onClassExtendedCallCount = 0,
						    currentClassPassedIn;
						
						var MyClass = Class( {
							inheritedStatics : {
								onClassExtended : function( newClass ) {
									onClassExtendedCallCount++;
									currentClassPassedIn = newClass;
								}
							}
						} );
						
						Y.Assert.areSame( 1, onClassExtendedCallCount, "onClassExtended should have been called exactly once at this point" );
						Y.Assert.areSame( MyClass, currentClassPassedIn, "onClassExtended should have been passed the new class" );
						
						
						// Now create a subclass, without an explicit onClassExtended function. It should be used from the superclass
						var MySubClass = MyClass.extend( {} );
						
						Y.Assert.areSame( 2, onClassExtendedCallCount, "onClassExtended should have been called exactly twice at this point" );
						Y.Assert.areSame( MySubClass, currentClassPassedIn, "onClassExtended should have been passed the new subclass" );
					}
				}
			]
		},
		
		
		/*
		 * Test isInstanceOf()
		 */
		{
			name : "Test isInstanceOf()",
			
			"isInstanceOf() should return false for any primitive type" : function() {
				Y.Assert.isFalse( Class.isInstanceOf( undefined, Object ), "isInstanceOf should have returned false when given undefined" );
				Y.Assert.isFalse( Class.isInstanceOf( null, Object ), "isInstanceOf should have returned false when given null" );
				Y.Assert.isFalse( Class.isInstanceOf( 1, Object ), "isInstanceOf should have returned false when given a number" );
				Y.Assert.isFalse( Class.isInstanceOf( "hi", Object ), "isInstanceOf should have returned false when given a string" );
				Y.Assert.isFalse( Class.isInstanceOf( true, Object ), "isInstanceOf should have returned false when given a boolean" );
			},
			
			
			"isInstanceOf() should return true when testing an anonymous object with the Object constructor" : function() {
				Y.Assert.isTrue( Class.isInstanceOf( {}, Object ), "isInstanceOf should have returned true" );
			},
			
			
			"isInstanceOf() should return true when testing an object of a class" : function() {
				var MyClass = Class.extend( Object, { 
					constructor : function() {}
				} );
				
				var myInstance = new MyClass();
				
				Y.Assert.isTrue( Class.isInstanceOf( myInstance, MyClass ), "Should have been true. myInstance is an instance of MyClass" );
			},
			
			
			"isInstanceOf() should return true when testing an object that is a subclass of a given class" : function() {
				var MyClass = Class.extend( Object, { 
					constructor : function() {}
				} );
				var MySubClass = Class.extend( MyClass, {
					constructor : function() {}
				} );
				
				var myInstance = new MySubClass();
				
				Y.Assert.isTrue( Class.isInstanceOf( myInstance, MyClass ), "Should have been true. myInstance is an instance of MySubClass, which inherits from MyClass" );
			},
			
			
			"isInstanceOf() should return false when testing an object that is not an instance of a given class" : function() {
				var MyClass = Class.extend( Object, { 
					constructor : function() {}
				} );
				
				var SomeOtherClass = Class.extend( Object, {
					constructor : function() {}
				} );
				
				var myInstance = new SomeOtherClass();
				
				Y.Assert.isFalse( Class.isInstanceOf( myInstance, MyClass ), "Should have been false. myInstance is not an instance of MyClass" );
			},
			
			
			"isInstanceOf() should return true when testing an object that has a given mixin class" : function() {
				var MyMixinClass = Class.extend( Object, {
					constructor : function() {}
				} );
				
				var MyClass = Class.extend( Object, {
					mixins: [ MyMixinClass ], 
					constructor : function() {}
				} );
				
				var myInstance = new MyClass();
				
				Y.Assert.isTrue( Class.isInstanceOf( myInstance, MyMixinClass ), "Should have been true. myInstance has the mixin MyMixinClass" );
			},
			
			
			"isInstanceOf() should return true when testing an object that has a given mixin class implemented in its superclass" : function() {
				var MyMixinClass = Class.extend( Object, {
					constructor : function() {}
				} );
				
				var MyClass = Class.extend( Object, {
					mixins : [ MyMixinClass ], 
					constructor : function() {}
				} );
				var MySubClass = Class.extend( MyClass, { 
					constructor : function() {}
				} );
				
				var myInstance = new MySubClass();
				
				Y.Assert.isTrue( Class.isInstanceOf( myInstance, MyMixinClass ), "Should have been true. myInstance has the mixin MyMixinClass through its superclass" );
			},
			
			
			"isInstanceOf() should return true when testing an object that has a given mixin class implemented in its superclass's superclass" : function() {
				var MyMixinClass = Class.extend( Object, {
					constructor : function() {}
				} );
				
				var MyClass = Class.extend( Object, {
					mixins : [ MyMixinClass ], 
					constructor : function() {}
				} );
				var MySubClass = Class.extend( MyClass, { 
					constructor : function() {}
				} );
				var MySubSubClass = Class.extend( MySubClass, { 
					constructor : function() {}
				} );
				
				var myInstance = new MySubSubClass();
				
				Y.Assert.isTrue( Class.isInstanceOf( myInstance, MyMixinClass ), "Should have been true. myInstance has the mixin MyMixinClass through its superclass's superclass" );
			}
		},
		
		
		/*
		 * Test hasMixin()
		 */
		{
			name: "Test hasMixin()",
			
			setUp : function() {
				var me = this;
				
				// Hijack the static hasMixin() method on the Class object, so we can determine how many times it is called
				// (to figure out if caching is working)
				me.originalHasMixinMethod = Class.hasMixin;
				
				me.hasMixinCallCount = 0;
				Class.hasMixin = function( classToTest, mixinClass ) {
					me.hasMixinCallCount++;
					return me.originalHasMixinMethod( classToTest, mixinClass );
				};
			},
			
			tearDown : function() {
				Class.hasMixin = this.originalHasMixinMethod;
			},
			
			
			// ---------------------------------
			
			
			"hasMixin() should check the class for a given mixin" : function() {
				var Mixin = Class.extend( Object, {} );
				var SomeOtherMixin = Class.extend( Object, {} );
				
				var MyClass = Class.extend( Object, {	
					mixins : [ Mixin ]
				} );
				
				Y.Assert.isTrue( Class.hasMixin( MyClass, Mixin ), "MyClass should have the mixin 'Mixin'" );
				Y.Assert.isFalse( Class.hasMixin( MyClass, SomeOtherMixin ), "MyClass should *not* have the mixin 'SomeOtherMixin'" );
			},
			
			
			
			"hasMixin() should check the class and all of its superclasses for a given mixin" : function() {
				var Mixin = Class.extend( Object, {} );
				var SomeOtherMixin = Class.extend( Object, {} );
				var SomeOtherMixin2 = Class.extend( Object, {} );
				var NobodyHasThisMixin = Class.extend( Object, {} );
				
				var MySuperBaseClass = Class.extend( Object, {
					mixins : [ Mixin ]
				} );
				var MyBaseClass = Class.extend( MySuperBaseClass, {
					mixins : [ SomeOtherMixin ]
				} );
				var MyClass = Class.extend( MyBaseClass, {
					mixins : [ SomeOtherMixin2 ]
				} );
				
				// Looping tests twice. First iteration tests the lookup, second tests that caching is working correctly (i.e. has not skewed the result)
				for( var i = 0; i <= 1; i++ ) {
					var pass = ( i === 0 ) ? "initial" : "cached"; 
					Y.Assert.isTrue( Class.hasMixin( MyClass, Mixin ), "MyClass should have the mixin 'Mixin' from its superclass's superclass. pass = " + pass );
					Y.Assert.isTrue( Class.hasMixin( MyClass, SomeOtherMixin ), "MyClass should have the mixin 'SomeOtherMixin' on its superclass. pass = " + pass );
					Y.Assert.isTrue( Class.hasMixin( MyClass, SomeOtherMixin2 ), "MyClass should have the mixin 'SomeOtherMixin2' on itself. pass = " + pass );
					Y.Assert.isFalse( Class.hasMixin( MyClass, NobodyHasThisMixin ), "MyClass should *not* have the mixin 'NobodyHasThisMixin'. pass = " + pass );
				}
			},
			
			
			
			"hasMixin() should work with mixins and classes defined by regular functions (not using extend())" : function() {
				var Mixin = function() {};
				var SomeOtherMixin = function() {};
				var NobodyHasThisMixin = function() {};
				
				var MySuperBaseClass = function() {};
				var MyBaseClass = Class.extend( MySuperBaseClass, {
					mixins : [ Mixin ]
				} );
				var MyClass = Class.extend( MyBaseClass, {
					mixins : [ SomeOtherMixin ]
				} );
				
				// Looping tests twice. First iteration tests the lookup, second tests that caching is working correctly
				for( var i = 0; i <= 1; i++ ) {
					var pass = ( i === 0 ) ? "initial" : "cached"; 
					Y.Assert.isTrue( Class.hasMixin( MyClass, Mixin ), "MyClass should have the mixin 'Mixin' from its superclass. pass = " + pass );
					Y.Assert.isTrue( Class.hasMixin( MyClass, SomeOtherMixin ), "MyClass should have the mixin 'SomeOtherMixin' on itself. pass = " + pass );
					Y.Assert.isFalse( Class.hasMixin( MyClass, NobodyHasThisMixin ), "MyClass should *not* have the mixin 'NobodyHasThisMixin'. pass = " + pass );
				}
			},
			
			
			// ---------------------------------
			
			// Test hasMixin() caching
			
			
			"hasMixin() should assign an id to the mixinClass when the class is provided to hasMixin(), for use with caching if it doesn't already have one" : function() {
				var MyMixinClass = Class.extend( Object, {
					constructor : function() {}
				} );
				
				var MyClass = Class.extend( Object, {
					mixins : [ MyMixinClass ], 
					constructor : function() {}
				} );
				
				Y.Assert.isUndefined( MyMixinClass.__Class_classId, "Initial condition: MyClass should not yet have a __Class_classId" );
				
				// Now call the hasMixin() function, and check for the classId
				Class.hasMixin( MyClass, MyMixinClass );
				Y.Assert.isNumber( MyMixinClass.__Class_classId, "MyClass should now have a numeric __Class_classId" );
			},
			
			
			"hasMixin() should create a cache hashmap on the classToTest when the class is provided to hasMixin(), and it should not be re-created during subsequent calls" : function() {
				var MyMixinClass = Class.extend( Object, {
					constructor : function() {}
				} );
				
				var MyClass = Class.extend( Object, {
					mixins : [ MyMixinClass ], 
					constructor : function() {}
				} );
				
				Y.Assert.isUndefined( MyClass.__Class_hasMixinCache, "Initial condition: MyClass should not yet have a hasMixinCache" );
				
				// Now call the hasMixin() function, and check for the hasMixinCache
				Class.hasMixin( MyClass, MyMixinClass );
				var hasMixinCache = MyClass.__Class_hasMixinCache;
				Y.Assert.isObject( hasMixinCache, "MyClass should now have a hasMixinCache" );
				
				// Now call the hasMixin() function again, and check that it still has the same hasMixinCache
				Class.hasMixin( MyClass, MyMixinClass );
				Y.Assert.areSame( hasMixinCache, MyClass.__Class_hasMixinCache, "The has mixin cache should not have been re-created into a new object with a subsequent call to hasMixin()" );	
			},
			
			
			"hasMixin()'s caching should work" : function() {
				var MyMixinClass = Class.extend( Object, {
					constructor : function() {}
				} );
				
				var MyClass = Class.extend( Object, {
					mixins : [ MyMixinClass ], 
					constructor : function() {}
				} );
				var MySubClass = Class.extend( MyClass, { 
					constructor : function() {}
				} );
				
				
				// Upon the first call to hasMixin(), the hasMixinCallCount should be 2, as the superclass had to be checked
				Class.hasMixin( MySubClass, MyMixinClass );
				Y.Assert.areSame( 2, this.hasMixinCallCount, "Initial condition: There should have been 2 calls to hasMixin(), as the superclass had to be checked" );
				
				// Now when called again, the hasMixinCallCount should only increase by 1 (putting it at 3), as the result of checking
				// the superclass should have been cached
				Class.hasMixin( MySubClass, MyMixinClass );
				Y.Assert.areSame( 3, this.hasMixinCallCount, "There should have only been 3 calls to hasMixin() (one more than on last use of it), as the result from the superclass now should have been cached" );
			}
		}
	]
	
} );
