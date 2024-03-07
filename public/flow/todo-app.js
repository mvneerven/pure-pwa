import { CustomElement } from "../assets/js/common.js";
import { mockTodoAPI } from "./mock-todo-api.js";

customElements.define(
  "todo-app",
  class TodoApp extends CustomElement {
    constructor() {
      super();
      const newTaskSubmitted = (value) => {
        return value["task-name"];
      };

      this.state.todos = mockTodoAPI.load();

      this.addEventListener("state-change", (e) => {
        this.makeNotification(e);

        if (e.detail.path === "/todos" || e.detail.path.startsWith("/todos/"))
          mockTodoAPI.save(this.state.todos || []);

        if (e.detail.name === "x-form-data") {
          const value = e.detail.value;

          if (newTaskSubmitted(value)) {
            // User has submitted the form with a new task
            this.state.todos.push({
              title: value["task-name"],
              done: value["select-state"] === true
            });

            this.clearNewTaskTextbox();

            mockTodoAPI.save(this.state.todos || []);
          }
        }
      });
    }

    makeNotification(e) {
      let text = null;

      if (e.detail.type === "add") {
        text = "Task added...";
      } else if (
        e.detail.name === "length" &&
        e.detail.oldValue > e.detail.value
      ) {
        text = "Task removed...";
      } else if (e.detail.name === "done") {
        text = "Status changed....";
      }

      if (text) purePWA.messageBus.dispatch("notification", { text: text });
    }

    clearNewTaskTextbox() {
      this.querySelector("[name='task-name']").value = "";
    }

    /**
     * Public property, linked to proxied state.
     */
    get tasks() {
      return this.state.todos;
    }
  }
);
