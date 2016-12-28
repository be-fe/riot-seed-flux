### Riot-seed-flux使用指南

第一步，使用flux.createStore(options) API创建store, 每一个store对应一个数据资源

    var store = flux.createStore(options)
    
第二步， 数据的获取，options必须拥有一个get方法：
    
    options.get = function(params) {
        var self = this;
        $.ajax({
            ...
            data: params,
            success: function(result) {
                self.data = result.data;     //把数据赋值给options.data
                self.trigger('complete');    //options抛出'complete'事件
            },
            error: function(err) {
                self.trigger('error');    ////错误时抛出'error'事件
            }
        })
    }
    
第三步， 编写其他数据处理方法
    
    options.unshift = function(params) {
        if (isArray(this.data) && !isArray(params)) {
            this.data.unshift(params);
        }
        if (isArray(options.data) && isArray(params)) {
            this.data = params.concat(this.data);
        }
        this.trigger('complete');    //每次处理结束后都要抛出'complete'事件
    }  
    
第四步，将store和组件中的属性进行绑定

    flux.bind.call(this, {
        store: store, 
        name: 'data', 
        params: {id: 1},
        refresh: true,
        success: function() { //绑定成功后的回调 },
        error: function() { //绑定失败后的回调, 需要在get方法中trigger('error')才会触发。 }
    });
    
- 使用JS中的call/apply方法，将上下文转为组件内， 
- store即为我们刚刚创建的store对象
- name是组件中的属性值, key也可以使用property.
- params是提供给get方法的参数，
- refresh是判断每次绑定的时候是否强制执行get方法，默认一个资源如果已经被请求，再次bind的时候会使用上次的数据，设为true的时候则会每次bind都更新数据。
- success是绑定成功的回调
- error是绑定失败的回调

第五步，bind以后，在任何地方使用`store.unshift(params); store.get(params);` 等之前定义的方法来修改数据，那么跟这个数据资源相关的视图都会被修改。
