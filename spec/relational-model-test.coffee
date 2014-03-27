describe "Model", () ->

  describe "コモンメソッド", () ->
    
    beforeEach () ->
      class Employee
        Model.mixin(@)
      @employee = new Employee()
      
    afterEach () ->
      delete @employee
    
    it "クラス名を取得できる", () ->
      expect(@employee.getClassName()).to.eql("Employee")
      
    it "プロパティを設定できる", () ->
      @employee.setProperty("testKey", "testValue")
      expect(@employee.attrs()["testKey"]).to.eql("testValue")
      
    it "プロパティの存在を確認できる", () ->
      @employee.setProperty("testKey", "testValue")
      expect(@employee.hasProperty("testKey")).to.eql(true)
      
    it "プロパティが存在しないことを確認できる", () ->
      expect(@employee.hasProperty("testKey")).to.eql(false)
      
    it "プロパティを取得できる", () ->
      @employee.setProperty("testKey", "testValue")
      expect(@employee.getProperty("testKey")).to.eql("testValue")
      
    it "存在しないプロパティを取得する場合は例外が発生する", () ->
      expect(() =>
        @employee.getProperty("testKey")
      ).to.throwException((e) ->
        expect(e.message).to.eql("""
            Employee has not testKey property.
                attrs: {}
        """)
      )
      
    it "ショートカットを利用してプロパティを設定できる", () ->
      @employee.set("testKey", "testValue")
      expect(@employee.attrs()["testKey"]).to.eql("testValue")
      
    it "ショートカットを利用してプロパティを取得できる", () ->
      @employee.set("testKey", "testValue")
      expect(@employee.get("testKey")).to.eql("testValue")
      
    it "ショートカットのプロパティ取得では存在しないプロパティはundefinedで取得できる", () ->
      expect(@employee.get("none")).to.eql(undefined)
      
    describe "保持するプロパティを制限できる", () ->
      
      beforeEach () ->
        class Employee
          Model.mixin(@)
          @expectAttrs(["id", "name"])
        @employee = new Employee()
        
      afterEach () ->
        delete @employee
      
      it "プロパティ制限以外のプロパティを保存する場合無視される", () ->
        @employee.setProperty("errorKey", "errorValue")
        expect(@employee.attrs()).to.not.have.property("errorKey")
        
    describe "関連定義が必要なコモンメソッド", () ->
    
      beforeEach () ->
        @data = {
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
        
        class @Employee
          Model.mixin(@)
          @hasMany("assigns")
          @hasMany("departments", {through: "assigns"})
          
        class @Assign
          Model.mixin(@)
          @belongsTo("employee")
          @belongsTo("department")

        class @Department
          Model.mixin(@)
          @hasMany("assigns")
          @hasMany("employees", {through: "assigns"})
          
      afterEach () ->
        delete @Employee
        delete @Assign
        delete @Department
        delete @data
        
      it "toJSでデータを出力できる", () ->
        group = @Employee.grouping(@data)
        @Employee.mapping(group)
        js = group.model.toJS()
        expect(js).to.eql({
          id: 1
          name: "emp1"
        })
        
      it "toJSで関連データを出力できる", () ->
        group = @Employee.grouping(@data)
        @Employee.mapping(group)
        js = group.model.toJS({"departments": {}, "assigns": ["department"]})
        expect(js).to.eql({
          id: 1
          name: "emp1"
          departments: [{
            id: 11
            name: "dept11"
          }]
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
            department: {
              id: 11
              name: "dept11"
            }
          }]
        })
      
      it "fromJSでデータを取り込める", () ->
        employee = new @Employee()
        employee.set("id", -1)
        employee.fromJS(@data)
        expect(employee.toJS()).to.eql({
          id: 1
          name: "emp1"
        })
        
      it "fromJSで関連データを取り込める", () ->
        employee = new @Employee()
        employee.set("id", -1)
        employee.fromJS(@data)
        expect(employee.toJS({"departments": {}, "assigns": ["department"]})).to.eql({
          id: 1
          name: "emp1"
          departments: [{
            id: 11
            name: "dept11"
          }]
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
            department: {
              id: 11
              name: "dept11"
            }
          }]
        })
      
      it "createで新しいオブジェクトを作成できる", () ->
        data = {
          id: 1
          name: "emp1"
        }
        employee = @Employee.create(data)
        expect(employee.attrs()).to.eql(data)
        
      it "createで関連も読み込んで新しいオブジェクトを作成できる", () ->
        employee = @Employee.create(@data)
        expect(employee.attrs()).to.have.property("id", 1)
        expect(employee.attrs()).to.have.property("name", "emp1")
        
        # employee.assignsが取り込んだデータと一致する
        expect(employee.attrs()).to.have.property("assigns")
        
        assigns = employee.get("assigns")
        expect(assigns.length).to.eql(2)
        
        expect(assigns[0].attrs()).to.have.property("id", 21)
        expect(assigns[0].attrs()).to.have.property("employeeId", 1)
        expect(assigns[0].attrs()).to.have.property("departmentId", 11)
        
        expect(assigns[1].attrs()).to.have.property("id", 22)
        expect(assigns[1].attrs()).to.have.property("employeeId", 1)
        expect(assigns[1].attrs()).to.have.property("departmentId", 11)
        
        # employee.assings.departmentが取り込んだデータと一致する
        expect(employee.attrs()).to.have.property("assigns")
        
        department = employee.get("assigns")[0].get("department")
        expect(department.attrs()).to.have.property("id", 11)
        expect(department.attrs()).to.have.property("name", "dept11")
        
        # employee.departmentsが取り込んだデータと一致する
        expect(employee.attrs()).to.have.property("departments")
        
        departments = employee.get("departments")
        
        expect(departments.length).to.eql(1)
        expect(departments[0].attrs()).to.have.property("id", 11)
        expect(departments[0].attrs()).to.have.property("name", "dept11")
  
  describe "定義メソッド", () ->
      
    it "belongsToの定義ができる", () ->
      class Employee
        Model.mixin(@)
        @belongsTo("test")
        
      class Test
        Model.mixin(@)
        
      expect(Employee.associations()["test"]).to.eql({
        type: "belongsTo"
        options: {
          model: "Test"
        }
      })
      
    it "hasOneの定義ができる", () ->
      class Employee
        Model.mixin(@)
        @hasOne("test")
        
      class Test
        Model.mixin(@)
        
      expect(Employee.associations()["test"]).to.eql({
        type: "hasOne"
        options: {
          model: "Test"
        }
      })
      
    it "hasManyの定義ができる", () ->
      class Employee
        Model.mixin(@)
        @hasMany("tests")
        
      class Test
        Model.mixin(@)
        
      expect(Employee.associations()["tests"]).to.eql({
        type: "hasMany"
        options: {
          model: "Test"
        }
      })
      
  describe "グルーピング", () ->
  
    it "フラットなモデルのグループ情報を取得できる", () ->
      class Employee
        Model.mixin(@)
      data = {
        id: 1
        name: "emp1"
      }
      group = Employee.grouping(data)
      expect(group.models["Employee"][1].attrs()).to.eql(data)
      

    it "belongsTo関連のグループ情報を取得できる", () ->
      class Employee
        Model.mixin(@)
        @belongsTo("department")
      class Department
        Model.mixin(@)
      
      data = {
        id: 1
        name: "emp1"
        department: {
          id: 21
          name: "dep1"
        }
      }
      group = Employee.grouping(data)
      expect(group.models["Employee"][1].attrs()).to.eql({
        id: 1
        name: "emp1"
      })
      expect(group.models["Department"][21].attrs()).to.eql({
        id: 21
        name: "dep1"
      })
      
    it "hasOne関連のグループ情報を取得できる", () ->
      class Employee
        Model.mixin(@)
        @hasOne("department")
        
      class Deparment
        Model.mixin(@)
        
      data = {
        id: 1
        name: "emp1"
        department: {
          id: 21
          name: "dep1"
        }
      }
      group = Employee.grouping(data)
      expect(group.models["Employee"][1].attrs()).to.eql({
        id: 1
        name: "emp1"
      })
      expect(group.models["Department"][21].attrs()).to.eql({
        id: 21
        name: "dep1"
      })
      
    it "hasMany関連のグループ情報を取得できる", () ->
      class Employee
        Model.mixin(@)
        @hasMany("departments")
        
      class Deparment
        Model.mixin(@)
        
      data = {
        id: 1
        name: "emp1"
        departments: [{
          id: 21
          name: "dep1"
        }]
      }
      group = Employee.grouping(data)
      expect(group.models["Employee"][1].attrs()).to.eql({
        id: 1
        name: "emp1"
      })
      expect(group.models["Department"][21].attrs()).to.eql({
        id: 21
        name: "dep1"
      })
      
    it "hasMany関連でデータが配列以外の場合は例外を発生させる", () ->
      class Employee
        Model.mixin(@)
        @hasMany("departments")
        
      class Deparment
        Model.mixin(@)
        
      data = {
        id: 1
        name: "emp1"
        departments: {
          id: 21
          name: "dep1"
        }
      }
      expect(() ->
        Employee.grouping(data)
      ).to.throwException((e) ->
        expect(e.message).to.eql("Employee has departments property is not array.")
      )
      
    it "expectが指定されている場合はそれ以外のプロパティを無視する", () ->
      class Employee
        Model.mixin(@)
        @expectAttrs(["id", "name"])
      
      data = {
        id: 1
        name: "dept1"
        other1: {}
        other2: ""
      }
      group = Employee.grouping(data)
      attrs = group.models["Employee"][1].attrs()
      expect(attrs).to.not.have.property("other1")
      expect(attrs).to.not.have.property("other2")
      
  describe "マッピング", () ->
  
    it "belongsTo関連でマッピングができる", () ->
      data = {
        id: 1
        name: "emp1"
        departmentId: 21
        department: {
          id: 21
          name: "dept1"
        }
      }
      class Employee
        Model.mixin(@)
        @belongsTo("department")
        
      class Department
        Model.mixin(@)
      
      group = Employee.grouping(data)
      Employee.mapping(group)
      
      employee = group.model
      expect(employee.getProperty("department").attrs()).to.eql({
        id: 21
        name: "dept1"
      })
      
    it "hasOne関連でマッピングできる", () ->
      data = {
        id: 1
        name: "emp1"
        departmentId: 21
        department: {
          id: 21
          name: "dept1"
        }
      }
      
      class Employee
        Model.mixin(@)
        @belongsTo("department")
      
      class Department
        Model.mixin(@)
        @hasOne("employee")
      
      group = Employee.grouping(data)
      Employee.mapping(group)
      
      employee = group.model
      expect(employee.get("department").attrs()).to.have.property("id", 21)
      expect(employee.get("department").attrs()).to.have.property("name", "dept1")
      expect(employee.get("department").get("employee")).to.a(Employee)
      expect(employee.get("department").get("employee").attrs()).to.have.property("id", 1)
      expect(employee.get("department").get("employee").attrs()).to.have.property("name", "emp1")
      
    it "hasMany関連でマッピングできる", () ->
      data = {
        id: 21
        name: "dept1"
        employees: [{
          id: 1
          name: "emp1"
          departmentId: 21
        }, {
          id: 2
          name: "emp2"
          departmentId: 21
        }]
      }
      class Employee
        Model.mixin(@)
        @belongsTo("department")
        
      class Department
        Model.mixin(@)
        @hasMany("employees")
        
      group = Department.grouping(data)
      Department.mapping(group)
      
      department = group.model
      expect(department.attrs()).to.have.property("id", 21)
      expect(department.attrs()).to.have.property("name", "dept1")
      expect(department.attrs()).to.have.property("employees")
      
      employee1 = department.get("employees")[0]
      expect(employee1.attrs()).to.have.property("id", 1)
      expect(employee1.attrs()).to.have.property("name", "emp1")
      expect(employee1.attrs()).to.have.property("department")
      expect(employee1.get("department").attrs()).to.have.property("id", 21)
      expect(employee1.get("department").attrs()).to.have.property("name", "dept1")
      
      employee2 = department.get("employees")[1]
      expect(employee2.attrs()).to.have.property("id", 2)
      expect(employee2.attrs()).to.have.property("name", "emp2")
      expect(employee2.attrs()).to.have.property("department")
      expect(employee2.get("department").attrs()).to.have.property("id", 21)
      expect(employee2.get("department").attrs()).to.have.property("name", "dept1")
  
    describe "hasManyThrough関連でマッピングできる", () ->

      before () ->
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
        
        group = Employee.grouping(data)
        Employee.mapping(group)
        @employee = group.model
      
      after () ->
        delete @employee
        
      it "employeeのモデルが取り込んだデータと一致する", () ->
        expect(@employee.attrs()).to.have.property("id", 1)
        expect(@employee.attrs()).to.have.property("name", "emp1")
        
      it "employee.assignsが取り込んだデータと一致する", () ->
        expect(@employee.attrs()).to.have.property("assigns")
        
        assigns = @employee.get("assigns")
        expect(assigns.length).to.eql(2)
        
        expect(assigns[0].attrs()).to.have.property("id", 21)
        expect(assigns[0].attrs()).to.have.property("employeeId", 1)
        expect(assigns[0].attrs()).to.have.property("departmentId", 11)
        
        expect(assigns[1].attrs()).to.have.property("id", 22)
        expect(assigns[1].attrs()).to.have.property("employeeId", 1)
        expect(assigns[1].attrs()).to.have.property("departmentId", 11)
        
      it "employee.assings.departmentが取り込んだデータと一致する", () ->
        expect(@employee.attrs()).to.have.property("assigns")
        
        department = @employee.get("assigns")[0].get("department")
        expect(department.attrs()).to.have.property("id", 11)
        expect(department.attrs()).to.have.property("name", "dept11")
        
      it "employee.departmentsが取り込んだデータと一致する", () ->
        expect(@employee.attrs()).to.have.property("departments")
        
        departments = @employee.get("departments")
        
        expect(departments.length).to.eql(1)
        expect(departments[0].attrs()).to.have.property("id", 11)
        expect(departments[0].attrs()).to.have.property("name", "dept11")
  