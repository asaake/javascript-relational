javascript-relational
=====================

javascriptでリレーショナルモデルを処理するモデルクラス

```coffee
# 使い方

data = {
  id: 1
  name: "emp1"
  assigns: [{
    id: 21
    employeeId: 1
    departmentId: 11
    department: {
      id: 11
      name: "dept11"
    }
  }, {
    id: 22
    employeeId: 1
    departmentId: 11
  }]
}

class Employee
  Model.mixin(@)
  @hasMany("assigns")
  @hasMany("departments", {through: "assigns"})
  
class Assign
  Model.mixin(@)
  @belongsTo("employee")
  @belongsTo("department")

class Department
  Model.mixin(@)
  @hasMany("assigns")
  @hasMany("employees", {through: "assigns"})
  
employee = Employee.create(data)
employee.get("id") # 1
employee.get("name") # emp1

employee.get("assigns")[0].toJS() # {id: 21, employeeId: 1, departmentId: 11}
employee.get("assigns")[1].toJS() # {id: 22, employeeId: 1, departmentId: 11}
employee.get("assigns")[0].get("department").toJS() # {id: 11, name: "dept11"}
employee.get("departments")[0].toJS() # {id: 11, name: "dept11"}

employee.toJS({"assigns": ["department"], "departments": {}})
# include employee.assings.department, employee.departments

employee.fromJS(data) # import data

employee.fromJSON(JSON.stringify(data)) # import json data

employee.toJSON(["assigns"]) # export json data

employee.attrs() # {id: 1, name: "emp1", assigns: [...], departments: [...]}
```
