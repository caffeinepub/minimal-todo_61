import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Array "mo:core/Array";

actor {
  type Todo = {
    id : Nat;
    text : Text;
    completed : Bool;
    createdAt : Int;
  };

  module Todo {
    public func compare(todo1 : Todo, todo2 : Todo) : Order.Order {
      Nat.compare(todo1.id, todo2.id);
    };
  };

  var nextId = 0;
  let todos = Map.empty<Nat, Todo>();

  public shared ({ caller }) func addTodo(text : Text) : async () {
    let todo : Todo = {
      id = nextId;
      text;
      completed = false;
      createdAt = Time.now();
    };

    todos.add(nextId, todo);
    nextId += 1;
  };

  public shared ({ caller }) func toggleTodo(id : Nat) : async () {
    switch (todos.get(id)) {
      case (null) { Runtime.trap("Todo not found. ") };
      case (?todo) {
        let updatedTodo = { todo with completed = not todo.completed };
        todos.add(id, updatedTodo);
      };
    };
  };

  public shared ({ caller }) func deleteTodo(id : Nat) : async () {
    switch (todos.get(id)) {
      case (null) { Runtime.trap("Todo not found. ") };
      case (?_) { todos.remove(id) };
    };
  };

  public query ({ caller }) func getTodos() : async [Todo] {
    todos.values().toArray().sort();
  };
};
