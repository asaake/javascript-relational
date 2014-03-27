this.Model = (function() {
  function Model() {}

  Model.mixin = function(clazz) {
    var capture, method, name, _ref;
    for (name in Model) {
      method = Model[name];
      clazz[name] = method;
    }
    if (this.relationalModels()[clazz.name] != null) {
      capture = {};
      Error.captureStackTrace(capture, this.mixin);
      console.warn("override relationalModel: " + clazz.name + " at " + capture.stack);
    }
    this.relationalModels()[clazz.name] = clazz;
    _ref = Model.prototype;
    for (name in _ref) {
      method = _ref[name];
      clazz.prototype[name] = method;
    }
  };

  Model.relationalModels = function() {
    return Model.relationalModels != null ? Model.relationalModels : Model.relationalModels = {};
  };

  Model.getRelationalModel = function(assoc) {
    var model;
    model = this.relationalModels()[assoc.options.model];
    if (model == null) {
      throw new Error("" + assoc.options.model + " is not registerd relationalModels");
    }
    return model;
  };

  Model.associations = function() {
    return this._associations != null ? this._associations : this._associations = {};
  };

  Model.assign = function(model, type, key, options) {
    if (options.model == null) {
      options.model = key.singularize().camelize();
    }
    return model.associations()[key] = {
      type: type,
      options: options
    };
  };

  Model.belongsTo = function(key, options) {
    if (options == null) {
      options = {};
    }
    return this.assign(this, "belongsTo", key, options);
  };

  Model.hasOne = function(key, options) {
    if (options == null) {
      options = {};
    }
    return this.assign(this, "hasOne", key, options);
  };

  Model.hasMany = function(key, options) {
    if (options == null) {
      options = {};
    }
    return this.assign(this, "hasMany", key, options);
  };

  Model.expectAttrs = function(expectAttrs) {
    if (expectAttrs == null) {
      expectAttrs = null;
    }
    if (arguments.length === 0) {
      return this._expectAttrs != null ? this._expectAttrs : this._expectAttrs = [];
    } else {
      return this._expectAttrs = expectAttrs;
    }
  };

  Model.prototype.getClassName = function() {
    return this.constructor.name;
  };

  Model.prototype.attrs = function() {
    return this._attrs != null ? this._attrs : this._attrs = {};
  };

  Model.prototype.hasProperty = function(name) {
    return this.attrs().hasOwnProperty(name);
  };

  Model.prototype.getProperty = function(name, expect) {
    if (expect == null) {
      expect = true;
    }
    if (expect && !this.hasProperty(name)) {
      throw new Error("" + (this.getClassName()) + " has not " + name + " property.\n    attrs: " + (JSON.stringify(this.attrs())));
    } else {
      return this.attrs()[name];
    }
  };

  Model.prototype.setProperty = function(name, value, expect) {
    var expectAttrs;
    if (expect == null) {
      expect = true;
    }
    expectAttrs = this.constructor.expectAttrs();
    if (!(expectAttrs.isEmpty())) {
      if (expectAttrs.indexOf(name) !== -1) {
        return this.attrs()[name] = value;
      }
    } else {
      return this.attrs()[name] = value;
    }
  };

  Model.prototype.get = function(name, expect) {
    if (expect == null) {
      expect = false;
    }
    return this.getProperty(name, expect);
  };

  Model.prototype.set = function(name, value, expect) {
    if (expect == null) {
      expect = false;
    }
    return this.setProperty(name, value, expect);
  };

  Model.grouping = function(data, models) {
    var assoc, item, key, model, modelClass, value, _i, _len, _name, _ref;
    if (models == null) {
      models = {};
    }
    model = new this();
    for (key in data) {
      value = data[key];
      assoc = (_ref = this.associations()) != null ? _ref[key] : void 0;
      if (!(assoc != null)) {
        model.setProperty(key, value);
      } else {
        switch (assoc.type) {
          case "hasMany":
            if (!Object.isArray(value)) {
              throw new Error("" + this.name + " has " + key + " property is not array.");
            }
            for (_i = 0, _len = value.length; _i < _len; _i++) {
              item = value[_i];
              modelClass = this.getRelationalModel(assoc);
              modelClass.grouping(item, models);
            }
            break;
          case "hasOne":
            modelClass = this.getRelationalModel(assoc);
            modelClass.grouping(value, models);
            break;
          case "belongsTo":
            modelClass = this.getRelationalModel(assoc);
            modelClass.grouping(value, models);
            break;
          default:
            throw new Error("" + assoc.type + " is not association type.");
        }
      }
    }
    if (models[_name = this.name] == null) {
      models[_name] = {};
    }
    if (models[this.name][model.getProperty("id")] != null) {
      console.debug("" + this.name + ":" + (model.getProperty('id')) + " is duplicated.");
    } else {
      models[this.name][model.getProperty("id")] = model;
    }
    return {
      model: model,
      models: models
    };
  };

  Model.mapping = function(group) {
    var assoc, clazz, id, key, lazyLoader, lazyLoaders, model, models, relationId, target, targets, through, _i, _len, _none, _ref, _ref1, _ref2, _ref3;
    lazyLoaders = [];
    _ref = group.models;
    for (clazz in _ref) {
      models = _ref[clazz];
      for (id in models) {
        model = models[id];
        _ref1 = model.constructor.associations();
        for (key in _ref1) {
          assoc = _ref1[key];
          switch (assoc.type) {
            case "hasMany":
              through = assoc.options.through;
              if (through != null) {
                (function(_this) {
                  return (function(id, model, key, assoc) {
                    return lazyLoaders.push(function() {
                      var done, relationId, target, targets, throughModel, _i, _len, _ref2;
                      if (!model.hasProperty(through)) {
                        throw new Error("" + (model.getClassName()) + " has not " + through + " relation. define relation is " + key + ".");
                      }
                      done = {};
                      targets = [];
                      _ref2 = model.getProperty(through);
                      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                        throughModel = _ref2[_i];
                        target = throughModel.getProperty(assoc.options.model.toLowerCase());
                        relationId = target.getProperty("id");
                        if (!done.hasOwnProperty(relationId)) {
                          targets.push(target);
                        }
                        done[relationId] = true;
                      }
                      if (!targets.isEmpty()) {
                        return model.setProperty(key, targets, false);
                      }
                    });
                  });
                })(this)(id, model, key, assoc);
              } else {
                targets = [];
                id = model.getProperty("id");
                _ref2 = group.models[assoc.options.model];
                for (_none in _ref2) {
                  target = _ref2[_none];
                  relationId = target.getProperty("" + (model.getClassName().toLowerCase()) + "Id");
                  if (id === relationId) {
                    targets.push(target);
                  }
                }
                if (!targets.isEmpty()) {
                  model.setProperty(key, targets, false);
                } else {
                  console.debug("" + (model.getClassName()) + " hasOne " + assoc.options.model + " is undefined.");
                }
              }
              break;
            case "hasOne":
              id = model.getProperty("id");
              _ref3 = group.models[assoc.options.model];
              for (_none in _ref3) {
                target = _ref3[_none];
                relationId = target.getProperty("" + (model.getClassName().toLowerCase()) + "Id");
                if (id === relationId) {
                  model.setProperty(key, target, false);
                  break;
                }
              }
              if (model.get(key) == null) {
                console.debug("" + (model.getClassName()) + " hasOne " + assoc.options.model + " is undefined.");
              }
              break;
            case "belongsTo":
              relationId = model.getProperty("" + (assoc.options.model.toLowerCase()) + "Id");
              target = group.models[assoc.options.model][relationId];
              if (target != null) {
                model.setProperty(key, target, false);
              } else {
                console.debug("" + (model.getClassName()) + " belongsTo " + assoc.options.model + " is undefined.");
              }
          }
        }
      }
    }
    for (_i = 0, _len = lazyLoaders.length; _i < _len; _i++) {
      lazyLoader = lazyLoaders[_i];
      lazyLoader();
    }
    return this;
  };

  Model.prototype.fromJSON = function(json) {
    this.fromJS(JSON.parse(json));
    return this;
  };

  Model.prototype.fromJS = function(data) {
    var group, key, value, _ref;
    group = this.constructor.grouping(data);
    this.constructor.mapping(group);
    _ref = group.model.attrs();
    for (key in _ref) {
      value = _ref[key];
      this.setProperty(key, value, false);
    }
    return this;
  };

  Model.prototype.toJS = function(includes) {
    var ary, assoc, js, key, model, value, _i, _len, _ref, _ref1, _ref2;
    if (includes == null) {
      includes = {};
    }
    if (!(Object.isObject(includes)) && !(Object.isArray(includes))) {
      throw new Error("includes is object or array");
    }
    js = {};
    _ref = this.attrs();
    for (key in _ref) {
      value = _ref[key];
      js[key] = value;
    }
    _ref1 = this.constructor.associations();
    for (key in _ref1) {
      assoc = _ref1[key];
      if (!(includes != null) || (Object.isObject(includes) && !(includes.hasOwnProperty(key))) || (Object.isArray(includes) && includes.indexOf(key) === -1)) {
        delete js[key];
      } else {
        if (Object.isArray(js[key])) {
          ary = [];
          _ref2 = js[key];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            model = _ref2[_i];
            ary.push(model.toJS(includes[key]));
          }
          js[key] = ary;
        } else {
          js[key] = js[key].toJS(includes[key]);
        }
      }
    }
    return js;
  };

  Model.prototype.toJSON = function(includes) {
    if (includes == null) {
      includes = [];
    }
    return JSON.stringify(this.toJS(includes));
  };

  return Model;

})();