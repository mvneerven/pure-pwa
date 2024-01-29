const STORAGE_NAME = "todos";

class MockTodoAPI {
  
  load() {
    return JSON.parse(localStorage.getItem(STORAGE_NAME) || "[]");
  }

  save(data) {
    if(!Array.isArray(data)){
      console.warn("No valid data passed to save()");
      return;
    }
      
    let stringValue = JSON.stringify(data);
    localStorage.setItem(STORAGE_NAME, stringValue);
  }
}

const mockTodoAPI = new MockTodoAPI()

export { mockTodoAPI }