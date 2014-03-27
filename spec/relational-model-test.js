describe("Model", function() {
  describe("コモンメソッド", function() {
    beforeEach(function() {
      var Employee;
      Employee = (function() {
        function Employee() {}

        Model.mixin(Employee);

        return Employee;

      })();
      return this.employee = new Employee();
    });
    afterEach(function() {
      return delete this.employee;
    });
    it("クラス名を取得できる", function() {
      return expect(this.employee.getClassName()).to.eql("Employee");
    });
    it("プロパティを設定できる", function() {
      this.employee.setProperty("testKey", "testValue");
      return expect(this.employee.attrs()["testKey"]).to.eql("testValue");
    });
    it("プロパティの存在を確認できる", function() {
      this.employee.setProperty("testKey", "testValue");
      return expect(this.employee.hasProperty("testKey")).to.eql(true);
    });
    it("プロパティが存在しないことを確認できる", function() {
      return expect(this.employee.hasProperty("testKey")).to.eql(false);
    });
    it("プロパティを取得できる", function() {
      this.employee.setProperty("testKey", "testValue");
      return expect(this.employee.getProperty("testKey")).to.eql("testValue");
    });
    it("存在しないプロパティを取得する場合は例外が発生する", function() {
      return expect((function(_this) {
        return function() {
          return _this.employee.getProperty("testKey");
        };
      })(this)).to.throwException(function(e) {
        return expect(e.message).to.eql("Employee has not testKey property.\n    attrs: {}");
      });
    });
    it("ショートカットを利用してプロパティを設定できる", function() {
      this.employee.set("testKey", "testValue");
      return expect(this.employee.attrs()["testKey"]).to.eql("testValue");
    });
    it("ショートカットを利用してプロパティを取得できる", function() {
      this.employee.set("testKey", "testValue");
      return expect(this.employee.get("testKey")).to.eql("testValue");
    });
    it("ショートカットのプロパティ取得では存在しないプロパティはundefinedで取得できる", function() {
      return expect(this.employee.get("none")).to.eql(void 0);
    });
    describe("保持するプロパティを制限できる", function() {
      beforeEach(function() {
        var Employee;
        Employee = (function() {
          function Employee() {}

          Model.mixin(Employee);

          Employee.expectAttrs(["id", "name"]);

          return Employee;

        })();
        return this.employee = new Employee();
      });
      afterEach(function() {
        return delete this.employee;
      });
      return it("プロパティ制限以外のプロパティを保存する場合無視される", function() {
        this.employee.setProperty("errorKey", "errorValue");
        return expect(this.employee.attrs()).to.not.have.property("errorKey");
      });
    });
    return describe("関連定義が必要なコモンメソッド", function() {
      beforeEach(function() {
        this.data = {
          id: 1,
          name: "emp1",
          assigns: [
            {
              id: 21,
              employeeId: 1,
              departmentId: 11,
              department: {
                id: 11,
                name: "dept11"
              }
            }, {
              id: 22,
              employeeId: 1,
              departmentId: 11
            }
          ]
        };
        this.Employee = (function() {
          function Employee() {}

          Model.mixin(Employee);

          Employee.hasMany("assigns");

          Employee.hasMany("departments", {
            through: "assigns"
          });

          return Employee;

        })();
        this.Assign = (function() {
          function Assign() {}

          Model.mixin(Assign);

          Assign.belongsTo("employee");

          Assign.belongsTo("department");

          return Assign;

        })();
        return this.Department = (function() {
          function Department() {}

          Model.mixin(Department);

          Department.hasMany("assigns");

          Department.hasMany("employees", {
            through: "assigns"
          });

          return Department;

        })();
      });
      afterEach(function() {
        delete this.Employee;
        delete this.Assign;
        delete this.Department;
        return delete this.data;
      });
      it("toJSでデータを出力できる", function() {
        var group, js;
        group = this.Employee.grouping(this.data);
        this.Employee.mapping(group);
        js = group.model.toJS();
        return expect(js).to.eql({
          id: 1,
          name: "emp1"
        });
      });
      it("toJSで関連データを出力できる", function() {
        var group, js;
        group = this.Employee.grouping(this.data);
        this.Employee.mapping(group);
        js = group.model.toJS({
          "departments": {},
          "assigns": ["department"]
        });
        return expect(js).to.eql({
          id: 1,
          name: "emp1",
          departments: [
            {
              id: 11,
              name: "dept11"
            }
          ],
          assigns: [
            {
              id: 21,
              employeeId: 1,
              departmentId: 11,
              department: {
                id: 11,
                name: "dept11"
              }
            }, {
              id: 22,
              employeeId: 1,
              departmentId: 11,
              department: {
                id: 11,
                name: "dept11"
              }
            }
          ]
        });
      });
      it("fromJSでデータを取り込める", function() {
        var employee;
        employee = new this.Employee();
        employee.set("id", -1);
        employee.fromJS(this.data);
        return expect(employee.toJS()).to.eql({
          id: 1,
          name: "emp1"
        });
      });
      return it("fromJSで関連データを取り込める", function() {
        var employee;
        employee = new this.Employee();
        employee.set("id", -1);
        employee.fromJS(this.data);
        return expect(employee.toJS({
          "departments": {},
          "assigns": ["department"]
        })).to.eql({
          id: 1,
          name: "emp1",
          departments: [
            {
              id: 11,
              name: "dept11"
            }
          ],
          assigns: [
            {
              id: 21,
              employeeId: 1,
              departmentId: 11,
              department: {
                id: 11,
                name: "dept11"
              }
            }, {
              id: 22,
              employeeId: 1,
              departmentId: 11,
              department: {
                id: 11,
                name: "dept11"
              }
            }
          ]
        });
      });
    });
  });
  describe("定義メソッド", function() {
    it("belongsToの定義ができる", function() {
      var Employee, Test;
      Employee = (function() {
        function Employee() {}

        Model.mixin(Employee);

        Employee.belongsTo("test");

        return Employee;

      })();
      Test = (function() {
        function Test() {}

        Model.mixin(Test);

        return Test;

      })();
      return expect(Employee.associations()["test"]).to.eql({
        type: "belongsTo",
        options: {
          model: "Test"
        }
      });
    });
    it("hasOneの定義ができる", function() {
      var Employee, Test;
      Employee = (function() {
        function Employee() {}

        Model.mixin(Employee);

        Employee.hasOne("test");

        return Employee;

      })();
      Test = (function() {
        function Test() {}

        Model.mixin(Test);

        return Test;

      })();
      return expect(Employee.associations()["test"]).to.eql({
        type: "hasOne",
        options: {
          model: "Test"
        }
      });
    });
    return it("hasManyの定義ができる", function() {
      var Employee, Test;
      Employee = (function() {
        function Employee() {}

        Model.mixin(Employee);

        Employee.hasMany("tests");

        return Employee;

      })();
      Test = (function() {
        function Test() {}

        Model.mixin(Test);

        return Test;

      })();
      return expect(Employee.associations()["tests"]).to.eql({
        type: "hasMany",
        options: {
          model: "Test"
        }
      });
    });
  });
  describe("グルーピング", function() {
    it("フラットなモデルのグループ情報を取得できる", function() {
      var Employee, data, group;
      Employee = (function() {
        function Employee() {}

        Model.mixin(Employee);

        return Employee;

      })();
      data = {
        id: 1,
        name: "emp1"
      };
      group = Employee.grouping(data);
      return expect(group.models["Employee"][1].attrs()).to.eql(data);
    });
    it("belongsTo関連のグループ情報を取得できる", function() {
      var Department, Employee, data, group;
      Employee = (function() {
        function Employee() {}

        Model.mixin(Employee);

        Employee.belongsTo("department");

        return Employee;

      })();
      Department = (function() {
        function Department() {}

        Model.mixin(Department);

        return Department;

      })();
      data = {
        id: 1,
        name: "emp1",
        department: {
          id: 21,
          name: "dep1"
        }
      };
      group = Employee.grouping(data);
      expect(group.models["Employee"][1].attrs()).to.eql({
        id: 1,
        name: "emp1"
      });
      return expect(group.models["Department"][21].attrs()).to.eql({
        id: 21,
        name: "dep1"
      });
    });
    it("hasOne関連のグループ情報を取得できる", function() {
      var Deparment, Employee, data, group;
      Employee = (function() {
        function Employee() {}

        Model.mixin(Employee);

        Employee.hasOne("department");

        return Employee;

      })();
      Deparment = (function() {
        function Deparment() {}

        Model.mixin(Deparment);

        return Deparment;

      })();
      data = {
        id: 1,
        name: "emp1",
        department: {
          id: 21,
          name: "dep1"
        }
      };
      group = Employee.grouping(data);
      expect(group.models["Employee"][1].attrs()).to.eql({
        id: 1,
        name: "emp1"
      });
      return expect(group.models["Department"][21].attrs()).to.eql({
        id: 21,
        name: "dep1"
      });
    });
    it("hasMany関連のグループ情報を取得できる", function() {
      var Deparment, Employee, data, group;
      Employee = (function() {
        function Employee() {}

        Model.mixin(Employee);

        Employee.hasMany("departments");

        return Employee;

      })();
      Deparment = (function() {
        function Deparment() {}

        Model.mixin(Deparment);

        return Deparment;

      })();
      data = {
        id: 1,
        name: "emp1",
        departments: [
          {
            id: 21,
            name: "dep1"
          }
        ]
      };
      group = Employee.grouping(data);
      expect(group.models["Employee"][1].attrs()).to.eql({
        id: 1,
        name: "emp1"
      });
      return expect(group.models["Department"][21].attrs()).to.eql({
        id: 21,
        name: "dep1"
      });
    });
    it("hasMany関連でデータが配列以外の場合は例外を発生させる", function() {
      var Deparment, Employee, data;
      Employee = (function() {
        function Employee() {}

        Model.mixin(Employee);

        Employee.hasMany("departments");

        return Employee;

      })();
      Deparment = (function() {
        function Deparment() {}

        Model.mixin(Deparment);

        return Deparment;

      })();
      data = {
        id: 1,
        name: "emp1",
        departments: {
          id: 21,
          name: "dep1"
        }
      };
      return expect(function() {
        return Employee.grouping(data);
      }).to.throwException(function(e) {
        return expect(e.message).to.eql("Employee has departments property is not array.");
      });
    });
    return it("expectが指定されている場合はそれ以外のプロパティを無視する", function() {
      var Employee, attrs, data, group;
      Employee = (function() {
        function Employee() {}

        Model.mixin(Employee);

        Employee.expectAttrs(["id", "name"]);

        return Employee;

      })();
      data = {
        id: 1,
        name: "dept1",
        other1: {},
        other2: ""
      };
      group = Employee.grouping(data);
      attrs = group.models["Employee"][1].attrs();
      expect(attrs).to.not.have.property("other1");
      return expect(attrs).to.not.have.property("other2");
    });
  });
  return describe("マッピング", function() {
    it("belongsTo関連でマッピングができる", function() {
      var Department, Employee, data, employee, group;
      data = {
        id: 1,
        name: "emp1",
        departmentId: 21,
        department: {
          id: 21,
          name: "dept1"
        }
      };
      Employee = (function() {
        function Employee() {}

        Model.mixin(Employee);

        Employee.belongsTo("department");

        return Employee;

      })();
      Department = (function() {
        function Department() {}

        Model.mixin(Department);

        return Department;

      })();
      group = Employee.grouping(data);
      Employee.mapping(group);
      employee = group.model;
      return expect(employee.getProperty("department").attrs()).to.eql({
        id: 21,
        name: "dept1"
      });
    });
    it("hasOne関連でマッピングできる", function() {
      var Department, Employee, data, employee, group;
      data = {
        id: 1,
        name: "emp1",
        departmentId: 21,
        department: {
          id: 21,
          name: "dept1"
        }
      };
      Employee = (function() {
        function Employee() {}

        Model.mixin(Employee);

        Employee.belongsTo("department");

        return Employee;

      })();
      Department = (function() {
        function Department() {}

        Model.mixin(Department);

        Department.hasOne("employee");

        return Department;

      })();
      group = Employee.grouping(data);
      Employee.mapping(group);
      employee = group.model;
      expect(employee.get("department").attrs()).to.have.property("id", 21);
      expect(employee.get("department").attrs()).to.have.property("name", "dept1");
      expect(employee.get("department").get("employee")).to.a(Employee);
      expect(employee.get("department").get("employee").attrs()).to.have.property("id", 1);
      return expect(employee.get("department").get("employee").attrs()).to.have.property("name", "emp1");
    });
    it("hasMany関連でマッピングできる", function() {
      var Department, Employee, data, department, employee1, employee2, group;
      data = {
        id: 21,
        name: "dept1",
        employees: [
          {
            id: 1,
            name: "emp1",
            departmentId: 21
          }, {
            id: 2,
            name: "emp2",
            departmentId: 21
          }
        ]
      };
      Employee = (function() {
        function Employee() {}

        Model.mixin(Employee);

        Employee.belongsTo("department");

        return Employee;

      })();
      Department = (function() {
        function Department() {}

        Model.mixin(Department);

        Department.hasMany("employees");

        return Department;

      })();
      group = Department.grouping(data);
      Department.mapping(group);
      department = group.model;
      expect(department.attrs()).to.have.property("id", 21);
      expect(department.attrs()).to.have.property("name", "dept1");
      expect(department.attrs()).to.have.property("employees");
      employee1 = department.get("employees")[0];
      expect(employee1.attrs()).to.have.property("id", 1);
      expect(employee1.attrs()).to.have.property("name", "emp1");
      expect(employee1.attrs()).to.have.property("department");
      expect(employee1.get("department").attrs()).to.have.property("id", 21);
      expect(employee1.get("department").attrs()).to.have.property("name", "dept1");
      employee2 = department.get("employees")[1];
      expect(employee2.attrs()).to.have.property("id", 2);
      expect(employee2.attrs()).to.have.property("name", "emp2");
      expect(employee2.attrs()).to.have.property("department");
      expect(employee2.get("department").attrs()).to.have.property("id", 21);
      return expect(employee2.get("department").attrs()).to.have.property("name", "dept1");
    });
    return describe("hasManyThrough関連でマッピングできる", function() {
      before(function() {
        var Assign, Department, Employee, data, group;
        data = {
          id: 1,
          name: "emp1",
          assigns: [
            {
              id: 21,
              employeeId: 1,
              departmentId: 11,
              department: {
                id: 11,
                name: "dept11"
              }
            }, {
              id: 22,
              employeeId: 1,
              departmentId: 11
            }
          ]
        };
        Employee = (function() {
          function Employee() {}

          Model.mixin(Employee);

          Employee.hasMany("assigns");

          Employee.hasMany("departments", {
            through: "assigns"
          });

          return Employee;

        })();
        Assign = (function() {
          function Assign() {}

          Model.mixin(Assign);

          Assign.belongsTo("employee");

          Assign.belongsTo("department");

          return Assign;

        })();
        Department = (function() {
          function Department() {}

          Model.mixin(Department);

          Department.hasMany("assigns");

          Department.hasMany("employees", {
            through: "assigns"
          });

          return Department;

        })();
        group = Employee.grouping(data);
        Employee.mapping(group);
        return this.employee = group.model;
      });
      after(function() {
        return delete this.employee;
      });
      it("employeeのモデルが取り込んだデータと一致する", function() {
        expect(this.employee.attrs()).to.have.property("id", 1);
        return expect(this.employee.attrs()).to.have.property("name", "emp1");
      });
      it("employee.assignsが取り込んだデータと一致する", function() {
        var assigns;
        expect(this.employee.attrs()).to.have.property("assigns");
        assigns = this.employee.get("assigns");
        expect(assigns.length).to.eql(2);
        expect(assigns[0].attrs()).to.have.property("id", 21);
        expect(assigns[0].attrs()).to.have.property("employeeId", 1);
        expect(assigns[0].attrs()).to.have.property("departmentId", 11);
        expect(assigns[1].attrs()).to.have.property("id", 22);
        expect(assigns[1].attrs()).to.have.property("employeeId", 1);
        return expect(assigns[1].attrs()).to.have.property("departmentId", 11);
      });
      it("employee.assings.departmentが取り込んだデータと一致する", function() {
        var department;
        expect(this.employee.attrs()).to.have.property("assigns");
        department = this.employee.get("assigns")[0].get("department");
        expect(department.attrs()).to.have.property("id", 11);
        return expect(department.attrs()).to.have.property("name", "dept11");
      });
      return it("employee.departmentsが取り込んだデータと一致する", function() {
        var departments;
        expect(this.employee.attrs()).to.have.property("departments");
        departments = this.employee.get("departments");
        expect(departments.length).to.eql(1);
        expect(departments[0].attrs()).to.have.property("id", 11);
        return expect(departments[0].attrs()).to.have.property("name", "dept11");
      });
    });
  });
});