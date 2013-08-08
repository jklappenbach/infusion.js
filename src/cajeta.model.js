/**
 * Created with JetBrains WebStorm.
 * User: julian
 * Date: 8/4/13
 * Time: 4:08 PM
 * To change this template use File | Settings | File Templates.
 */
define([
    'jquery',
    'cajetaDS',
    'vcdiff'
], function($, Cajeta, vcDiff) {
    /**
     * The Model, as in traditional MVC architectures, defines the architecture and interfaces for how data is
     * structured and managed.
     */
    Cajeta.Model = {
        str: {
            DATASOURCE_STATECACHE_SETTINGS: 'DATASOURCE_STATECACHE_SETTINGS',
            DATASOURCE_STATECACHE: 'DATASOURCE_STATECACHE'
        }
    };

    /**
     * The default datasource for stateCache settings is memory, appearing as always uninitialized to the client
     * at startup.
     */
    Cajeta.Datasource.set(new Cajeta.Datasource.MemoryDS({
        id: Cajeta.Model.str.DATASOURCE_STATECACHE,
        uriTemplate: '/{applicationId}/stateCache/settings'
    }));

    /**
     * The default datasource for the stateCache is memory, appearing as always uninitialized to the client
     * at startup.
     */
    Cajeta.Datasource.set(new Cajeta.Datasource.MemoryDS({
        id: Cajeta.Model.str.DATASOURCE_STATECACHE_SETTINGS,
        uriTemplate: '/{applicationId}/stateCache/{stateId}'
    }));

    /**
     * Maintains the settings for the StateCache
     * @type {Object}
     */
    Cajeta.Model.StateCacheSettings = {
        stateId: 0,
        nextId: 0,
        keyPeriod: 10
    };

    /**
     * Cajeta.ModelSnapshotCache must support the following use cases:
     *  1.  Add a new snapshot to the collection, using Snapshot's compress
     *      function (currently delta compression) to reduce overhead
     *  2.  Maintain a set of "key frame" snapshots, so that the number of delta-decompression
     *      steps is kept under some maximum limit (perhaps every 10 frames).
     *  3.  Support state restoration of an arbitrary snapshot entry.
     *      a.  While individual snapshot elements will know how to reconstruct themselves given the
     *          previous state, it will be up to the Cache to know how to walk back to a "key frame",
     *          as well as how to iterate through each element in the list, to restore state.
     *  4.  Delete an existing state entry (or the entire cache)
     *  5.  Support an API that can easily be overridden for remote server implementation.  It would be cool
     *      to have application snapshot state stored centrally for mobile applications.
     */
    Cajeta.Model.StateCache = Cajeta.Class.extend({
        initialize: function(properties) {
            properties = properties || {};
            $.extend(this, properties);
            this.vcd = new vcDiff.Vcdiff();
            this.vcd.blockSize = 3;

            this.dsStateCacheSettings = Cajeta.Datasource.get(Cajeta.Datasource.str.DATASOURCE_STATECACHE_SETTINGS);
            this.scs = this.ds.get() || {
                stateId: 0,
                nextId: 0,
                keyPeriod: 10
            };
            this.dsStateCache = Cajeta.Datasource.get(Cajeta.Datasource.str.DATASOURCE_STATECACHE);
            this.dsStateCache.onComplete = this.onComplete; // This will never work, see how this can be fixed.
            this.modelJson = (this.scs.stateId == 0) ? '{ }' : this.dsStateCache.get({ stateId: this.scs.stateId });
        },
        getStateId: function() {
            return this.stateId;
        },

        add: function(model) {
            var json = JSON.stringify(model);
            if (this.scs.nextId % this.scs.keyPeriod > 0) {
                this.dsStateCache.put(this.vcd.encode(this.modelJson, json), { stateId: this.scs.nextId });
            } else {
                this.dsStateCache.put(json, { stateId: this.scs.nextId });
            }
            this.scs.stateId = this.scs.nextId++;
            this.modelJson = json;
            return this.stateId;
        },

        /**
         * First, find the key frame, and then iterate to the desired ID, restoring along the way.
         * TODO: Figure out how to wire this async to get things running with the new DS model.
         *
         * @param stateId
         */
        load: function(stateId) {
            var startId = stateId - (stateId % this.scs.keyPeriod);
            this.modelJson = this.dsStateCache.get({ stateId: startId });
            if (this.modelJson === undefined)
                throw Cajeta.str.ERROR_STATECACHE_LOADFAILURE;
            var delta;
            for (var i = startId + 1; i <= stateId; i++) {
                if (this.cache[i] === undefined)
                    throw Cajeta.str.ERROR_STATECACHE_LOADFAILURE;
                this.modelJson = this.vcd.decode(this.modelJson, this.cache[i]);
            }
            this.stateId = stateId;
            return JSON.parse(this.modelJson);
        },

        /**
         * Clear all entries.
         */
        clearAll: function() {
            this.cache = {};
            this.stateId = 0;
        },

        onComplete: function(data) {

        },

        onError: function(event) {

        }
    });


    /**
     * <h1>Cajeta.Model.ModelCache</h1>
     *
     * Cajeta.ModelCache provides a centralized container and services for an application's data model.
     * By placing the data for the application's model in a tree under a single element, we gain some significant
     * benefits.  First, it becomes a simple matter to bind components to data, ensuring that any changes are reflected
     * in a mapped two-way relationship.  Second, we gain the ability to easily distil application state into the
     * population of the underlying tree.  This state data can be snapshotted, converted to JSON, stored remotely, and
     * even shared with other clients.  With snapshots, we also gain the ability to easily implement undo, redo, and
     * restore operations.  Finally, we gain a degree of simplicity with this architecture. If there are data related
     * issues with the application, there's a clear place to start for diagnosis and maintenance efforts.
     *
     * <h2>Cache to Component Surjection</h2>
     * In providing bindings between components and values in the cache, the framework supports a surjection, or a
     * one-to-many (1:*) between a model node value and a set of components.  Components map their internal DOM
     * state to the model using a contained Cajeta.View.ModelAdaptor instance.  When one component's state is modified,
     * it's changes are persisted to the model, which then uses its internal mappings to identify the other components
     * to notify.
     *
     * <h2>Datasource Support</h2>
     * ModelCache has been designed around the support of multiple datasources by first providing a central
     * access point for shared datasources.  It further provides support by segmenting the cache by datasourceId,
     * simplifying design, and preventing possible namespace collisions in result sets (both sets could have foo.bar
     * as a valid path).   This has implications on potential designs for model structures.
     *
     * <h2>Cache Structure</h2>
     * While the cache has been envisioned to be a set of connected graphs, one per datasource, the application
     * developer is free to assign an arbitrary structure for the application model.  By default, a "local" datasource
     * is populated in the model, and can handle most transient data requirements.  For remote PUT requests, the
     * developer can create an entry for the datasource, using the URI for an ID, and add elements to the cache that
     * will serialize out to the JSON HTML body entity, or at least contain placeholders for query or URI arguments.
     * In the case of a POST, where data is bidirectional, the datasource entry in the cache can be populated with a
     * "request" and "response" root elements to separate outgoing from incoming data. For remote GET requests, JSON
     * result sets can be evaluated and placed directly under the datasource entry.
     *
     * Again, all of these are simply suggestions. The developer is free to structure their data, and the adaption
     * logic of that data to components, however they see fit.  The important
     *      *
     */
    Cajeta.Model.ModelCache = Cajeta.Events.EventDispatch.extend({
        /**
         * @param properties
         */
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            self.super.initialize.call(this, properties);

            this.componentMap = this.componentMap || {};
            this.nodeMap = this.nodeMap || {};
            this.stateCache = this.stateCache || new Cajeta.Model.StateCache();

            // First, see if we've been initialized with a desired stateId.  If not,
            // check to see if we have one in a cookie.  Otherwise, set it to zero.
            // TODO:  See if we can move this logic into the StateCache, without being difficult to intialize from the outside.
            this.stateId = 0;
//            if (this.stateId === undefined) {
//                this.stateId = jCookies.get("stateId");
//                this.stateId = this.stateId || 0;
//            }

            if (this.stateId != 0)
                this.stateCache.load(this.stateId);

            if (this.autoSnapshot === undefined)
                this.autoSnapshot = false;
        },

        /**
         * Sets a node in the model cache.  If datasourceId is ommitted, it will default to LOCAL_DATASOURCE.  If
         * component is present, it will prevent the notification of an update to the issuing component.
         *
         * @param modelPath The path to the node in the model cache
         * @param value The value to set
         * @param datasourceId (optional) The ID of the datasource, defaults to 'local'
         * @param component (optional) The issuing component, prevent cyclical updates.
         */
        set: function(modelPath, value, datasourceId, component) {
            datasourceId = datasourceId || Cajeta.str.LOCAL_DATASOURCE;
            modelPath = datasourceId + ':' + modelPath;

            // Find out if we have a single key, or a walk, and populate the map
            // if necessary to support the parent
            var index = modelPath.lastIndexOf('.');
            var key = null, node = null, parentPath = null;
            if (index >= 0) {
                parentPath = modelPath.substring(0, index);
                key = modelPath.substring(index + 1);
                var paths = modelPath.substring(0, index).split('.');
                node = this.nodeMap;
                for (var pathKey in paths) {
                    node = Cajeta.safeEntry(paths[pathKey], node);
                }
//                node = this.nodeMap[parentPath];
            } else  {
                key = modelPath;
                node = this.nodeMap;
            }

            // Then remove the indexes on child nodes of the element to be replaced
            this._removeNodeMapEntries(modelPath, node);

            node[key] = value;

            // And index the children of the new value
            this._addNodeMapEntries(modelPath, value, component);

            // Take a snapshot if we have auto set
            if (this.autoSnapshot == true)
                this.stateCache.add(this.state);

            // And send out a general notification on model changed.
            this.dispatchEvent(new Cajeta.Events.Event({ id: Cajeta.Events.EVENT_MODELCACHE_CHANGED }));
        },

        /**
         * Returns an object graph from the
         * @param datasourceId
         * @param modelPath
         * @return {*}
         */
        get: function(modelPath, datasourceId) {
            modelPath = (datasourceId || Cajeta.str.LOCAL_DATASOURCE) + ':' + modelPath;
            var node = this.nodeMap[modelPath];
            if (node === undefined)
                throw Cajeta.str.ERROR_MODELCACHE_PATH_UNDEFINED.format(modelPath);
            return node;
        },

        /**
         * Removes a node from the model.
         *
         * @param modelPath The path to the parent node for removal
         * @param datasourceId (optional) The ID of the datasource, defaults to 'local'
         */
        remove: function(modelPath, datasourceId) {
            datasourceId = datasourceId || Cajeta.str.LOCAL_DATASOURCE;
            modelPath = datasourceId + ':' + modelPath;

            if (this.nodeMap[modelPath] !== undefined) {
                var index = modelPath.lastIndexOf('.');
                var parent, key;
                if (index >= 0) {
                    parent = this.nodeMap[modelPath.substring(0, index)];
                    key = modelPath.substring(index + 1);
                } else {
                    parent = this.nodeMap[modelPath];
                    key = modelPath;
                }

                this._removeNodeMapEntries(modelPath, this.nodeMap[modelPath])
                delete parent[key];
            }

            var event = new Cajeta.Events.Event({ id: Cajeta.Events.EVENT_MODELCACHE_CHANGED });
            this.dispatchEvent(event);
        },

        /**
         * Clear all entries from the map
         */
        clearAll: function() {
            this.nodeMap = {};
        },

        getStateId: function() {
            return this.stateCache.getStateId();
        },

        /**
         * Saves the current model state to the stateCache, and returns the
         * ID applied to the save operation for future restoration.
         *
         * @return The new stateId
         */
        saveState: function() {
            return this.stateCache.add(this.nodeMap);
        },

        /**
         * Change the model to the history state indicated by stateId.  After the state has been
         * reconstituted, which includes all entries for path and component maps, every component within
         * the componentMap will be notified of an update.
         *
         * @param stateId The id of the history snapshot to restore and make current
         */
        loadState: function(stateId) {
            // First, check to see that the session ID matches our current...
            if (stateId == this.stateCache.getStateId())
                return;

            this.nodeMap = this.stateCache.load(stateId);

            // Now, notify all the things...
            for (var eventKey in this.eventListenerMap) {
                if (eventKey !== undefined) {
                    var event = new Cajeta.Events.Event({
                        id: Cajeta.Events.EVENT_MODELCACHE_CHANGED,
                        op: eventKey
                    });
                    var listeners = this.eventListenerMap[eventKey];
                    for (var listenerId in listeners) {
                        if (listenerId !== undefined) {
                            listeners[listenerId].onEvent(event);
                        }
                    }
                }
            }
        },

        /**
         * A helper override to simplify listenership.  It makes much more sense to have
         * modelAdaptors listen to model events.  However, for registration, it's easier to
         * just pass in a component.
         *
         * @param listener The listener to register for an event.
         * @param eventId The id of the event.
         * @param eventOp (optional) The operand to filter the event.
         */
        addListener: function(listener, eventId, eventOp) {
            if (listener instanceof Cajeta.View.Component) {
                listener = listener.modelAdaptor;
            }
            var self = (arguments.length > 3) ? arguments[3] : this;
            self.super.addListener.call(this, listener, eventId, eventOp);
        },

        /**
         * @private Internal method to recursively remove object graphs from the nodeMap
         *
         * @param modelPath The current model path to delete.
         * @param node The current node for recursion
         */
        _removeNodeMapEntries: function(modelPath, node) {
            if (typeof node != 'string' && typeof node != 'String') {
                for (var name in node) {
                    if (name !== undefined) {
                        this._removeNodeMapEntries(modelPath + '.' + name, node[name]);
                    }
                }
            }
            delete this.nodeMap[modelPath];
        },

        /**
         * @private Internal method, indexes object graphs added to the model using the pathMap
         *
         * @param modelPath The model path of the map in the current frame.
         * @param value A node in the object graph to add, algorithm will recurse to all leaves.
         * @param component Used to prevent cycles in update notification
         */
        _addNodeMapEntries: function(modelPath, value, component) {
            this.nodeMap[modelPath] = value;
            if (typeof value == "object") {
                for (var name in value) {
                    if (name !== undefined) {
                        this.nodeMap[modelPath + '.' + name] = value[name];
                        this._addNodeMapEntries(modelPath + '.' + name, value[name], component);
                    }
                }
            }

            // And notify any components bound to this modelPath...
            var ignore = component === undefined ? undefined : component.modelAdaptor;
            this.dispatchEvent(new Cajeta.Events.Event({
                id: Cajeta.Events.EVENT_MODELCACHE_CHANGED,
                op: modelPath
            }), ignore
            );
        }
    });

    return Cajeta;
});