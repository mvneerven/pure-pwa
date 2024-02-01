import { CustomElement } from "../assets/js/common.js";
import { mockTodoAPI } from "./mock-todo-api.js";

customElements.define(
  "todo-app",
  class TodoApp extends CustomElement {
    constructor() {
      super();
      this.state.todos = mockTodoAPI.load();

      this.addEventListener("state-change", (e) => {
        if (e.detail.path === "/todos" || e.detail.path.startsWith("/todos/"))
          mockTodoAPI.save(this.state.todos || []);

        if (e.detail.name === "x-form-data") {
          const value = e.detail.value;
          if (value["task-name"]) {
            // User has submitted the form with a new task
            this.state.todos.push({
              title: value["task-name"],
              done: value["select-state"] === true
            });

            purePWA.messageBus.dispatch("notification", {
              text: "Task added..."
            });

            // Clear New Task text field after addition
            this.querySelector("[name='task-name']").value = "";

            mockTodoAPI.save(this.state.todos || []);
          }
        }
      });
    }

    /**
     * Public property, linked to proxied state.
     */
    get tasks() {
      return this.state.todos;
    }
  }
);
