# js-app-config
Creates environment specific js objects or json config files for js apps. There are two use cases when this lib might suit your needs:

1. You want to create an environment dependent config for a node app.
2. You need an environment dependent config for client side code, where you don't want the parameters for other environments to leak into your packaged code. You can generate environment dependent json files with this lib, and include the generated file in your packaged code (another way do do this is to fetch the config from your backend, in which case you can use alternative 1 instead).

The main reason for creating this lib was to be able to store the configuration for all environments in a single file for easy overview.

## Usage

```javascript
const config = require('js-app-config')({
    environment: 'dev',
    file: 'myConfig.json',
    dir: __dirname + '/configurations'
});
```

Valid keys for the option object are:

- **environment**: environment to return config for. Defaults to `process.env.NODE_ENV || "dev"` if not supplied.
- **file**: file to read config from. Defaults to "config.json".
- **dir**: directory to look for file in. Default is `process.env.CONFIG_BASE_PATH || process.cwd()` if not supplied.
- **defaultKey**: reserved key for default values. Defaults value is "default".

Note: your configuration file can be pure js instead of json if you feel like it. Just make sure that the file exports a plain object and everything'll will work out of the box. See [example file](https://github.com/henhan/js-app-config/blob/master/test/resources/jsconf.js).

## Example

This configuration:

    {
        "env": {
            "default": "default",
            "dev": "development",
            "prod": "production"
        },
        "a": 1,
        "keys": {
            "default": {
                "key1": "val def"
            },
            "prod": {
                "key1": "val prod",
                "key2": "only prod"
            }
        },
        "nested": {
            "one": {
                "two": {
                    "default": "default value",
                    "dev": "dev value"
                }
            }
        },
        "prodOnly": {
            "default": null,
            "prod": "isProd"
        }
    }

Will generate the following for different supplied environment arguments:

"dev":

    {
        "env": "development",
        "a": 1,
        "keys": {
            "key1": "val def"
        },
        "nested": {
            "one": {
                "two": "dev value"
            }
        },
        "prodOnly": null
    }

"prod":

    {
        "env": "production",
        "a": 1,
        "keys": {
            "key1": "val prod",
            "key2": "only prod"
        },
        "nested": {
            "one": {
                "two": "default value"
            }
        },
        "prodOnly": "isProd"
    }

Any other:

    {
        "env": "default",
        "a": 1,
        "keys": {
            "key1": "val def"
        },
        "nested": {
            "one": {
                "two": "default value"
            }
        },
        "prodOnly": null
    }

## Configuration rules

- Any block that you want to differ in different environments is created by having a key named `default` in that object. For example, an object having the keys `default` and `myEnv` will return the content of `default` for all environments except one named `myEnv`, where the content of `myEnv` will be returned instead.
- The key `default` is reserved. Any object having that key will be treated as an environment dependent starting point. If you need to have `default` in your output config, change the reserved default key to something of your liking with the option `defaultKey` (see above). Using the name `default` nested within a default block will throw an error.
- Your environment names (i.e. any key names you use as siblings in objects having the default key) can be anything you like.
- All environment names will be treated as reserved. Using them as ordindary keys as well will throw errors.
- Set `default` to null if a path should only be set for some specific environment(s).

### Valid configuration examples

Using a default config for development and a separate conf for prod:

    {
        "env": {
            "default": "default",
            "prod": "production"
        },
        "a": 1,
        "b": [1, 2, 3],
        "keys": {
            "default": {
                "key1": "val def"
            },
            "prod": {
                "key1": "val prod",
                "key2": "only prod"
            }
        },
        "nested": {
            "one": {
                "two": {
                    "default": "def value",
                    "prod": "prod value"
                }
            }
        },
        "prodOnly": {
            "default": null,
            "prod": "isProd"
        }
    }

Same config for all environments:

    {
        "a": 1,
        "keys": {
            "key1": "val 1",
            "key2": "val 2",
        }
    }

Environment dependent on root level:

    {
        "default": {
            "conf1": "val1",
            "conf2": "val2",
            "conf3": {
                "key1": true
            }
        },
        "custom": {
            "conf1": "val3",
            "conf1": "val4",
            "conf3": {
                "key1": false
            }
        }
    }

### Invalid/erronous configuration examples

Nested default key (will throw error):

    {
        "default": {
            "obj1": {
                "default": "default"
            }
        },
        "other": {
            "obj1": "val1"
        }
    }

Nested environment key (will throw error):

    {
        "default": {
            "obj1": "hello"
        },
        "other": {
            "other": "world"
        }
    }

Using environment key without default being present (dangerous, will make the key present in all environments):

    {
        "setting1": {
            "default": "value 1",
            "prod": "value 2"
        }
        "setting2": {
            "prod": "Oops. Will be present in all environments now"
        }
    }
