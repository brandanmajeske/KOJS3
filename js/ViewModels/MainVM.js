$(function(){



	var VM1 = function(e,n,c){
		this.showEditor = ko.observable(e);
		this.name = ko.observable(n);
		this.count = ko.observable(c);
	};
	ko.applyBindings(new VM1(false,"Barbara",0), document.getElementById("independentBindings"));

	ko.applyBindings({
		items:["one", "two", "three"], 
		selectedItems: ko.observableArray(["one", "three"]) 
	}, document.getElementById("orderedBindings"));
	
	ko.applyBindings({ 
		items: [
			{id: 1, name: "one"},
			{id: 2, name: "two"}
		],
		selectedItems: ko.observableArray()
	}, document.getElementById("checkedValue"));


	// Custom Binding Preprocess function
	// valueWithInit checks if property exists on 
	// current context, if not creates it as an observable on the fly
	// populates with the elements value
	var VM2 = function(){

		ko.bindingHandlers.valueWithInit = {

			preprocess: function(value, name, addBindingCallback){
				return "'" + value + "'";
			},
			init: function(element, valueAccessor, allBindings, data, context){
				var prop = ko.unwrap(valueAccessor()),
					value = element.value;
				if (!prop in data || !ko.isObservable(data[prop])) {
					data[prop] = ko.observable();
				}

				data[prop](value);

				ko.applyBindingsToNode(element, {value: data[prop]}, context);
			}
		};
	}; // end VM2
	ko.applyBindings(new VM2(), document.getElementById("customBinding"));

	// Preprocessor Binding - Adding Binding Callbacks
	ko.bindingHandlers.live = {
		preprocess: function(value, name, addBindingCallback){
			addBindingCallback("valueUpdate", "'afterkeydown'");
			addBindingCallback("value", value);
		}
	};	
	ko.applyBindings({first: ko.observable("Bob")}, document.getElementById("customBindingLive"));

	// Preprocess Node Swapping... 
	ko.bindingProvider.instance.preprocessNode = function(node) {
		if (node.nodeType !== 1) {
			return;
		}

		var name = node.tagName.toLowerCase(),
			template = document.getElementById(name);
	
		if (template) {
			var newNode = document.createElement("div");
			newNode.setAttribute("data-bind", "template: '" + name + "'");

			node.parentNode.insertBefore(newNode, node);
			node.parentNode.removeChild(node);
		}
	};

	ko.applyBindings({first: ko.observable("Brandan")}, document.getElementById("preprocessNodes"));


	// Knockout Punches // 

	ko.punches.enableAll();
	var VM3 = function(name){
		this.name = ko.observable(name);
	};
	ko.applyBindings(new VM3("Jimmy"), document.getElementById("knockoutPunches"));

	// On Fly Bindings //


	var original = ko.getBindingHandler;
	ko.getBindingHandler = function(bindingKey) {
		var binding = original(bindingKey);
			
			

			if(!binding && bindingKey.indexOf('attr') > -1) {
				binding = {
					update: function(element, valueAccessor) {
						element.setAttribute(bindingKey, ko.unwrap(valueAccessor()));
					}
				};

				ko.bindingHandlers[bindingKey] = binding;
			}
			return binding;
		};

	ko.applyBindings({name: "My Item", description: "My Item's Description"}, document.getElementById("onFlyBindings"));

	// Array Changes //

	var viewModel = {
		count: 0,
		items: ko.observableArray([{name: "one"}]),

		addItem: function() {
			viewModel.items.push({name: "new" + viewModel.count++ });
		},
		removeItem: function(item){
			viewModel.items.remove(item);
		},
		swap: function(){
			var items = viewModel.items();
			viewModel.items([items[1], items[0]]);
		},

		changes: ko.observable()
	};

	viewModel.items.subscribe(viewModel.changes, null, "arrayChange");

	ko.applyBindings(viewModel, document.getElementById("VMarrayChanges"));


	// Computed Notifications //

	var VM4 = {
		items: ko.observableArray(["one"]),
		addItem: function(){
			this.items.push("new");
		},
		count: ko.observable(1)
	};

	VM4.canAddItems = ko.computed(function(){
		return this.items().length < 5;
	}, VM4).extend({notify: "always"});

	VM4.canAddItems.subscribe(function(){
		this.count(this.count() + 1);
	}, VM4);

	ko.applyBindings(VM4, document.getElementById("computedNotifications"));


});