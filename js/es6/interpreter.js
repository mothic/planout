import Assignment from '/Users/garidor1/Desktop/planout/js/es6/assignment';
import { initFactory, operatorInstance, StopPlanOutException } from '/Users/garidor1/Desktop/planout/js/es6/ops/utils';
import _ from "underscore";
import $ from 'jquery';

class Interpreter {
	constructor(serialization, experiment_salt='global_salt', inputs={}, environment) {
		this._serialization = serialization;
		if (!environment) {
			this._env = new Assignment(experiment_salt);
		} else {
			this._env = environment;
		}
		this.experiment_salt = this._experiment_salt = experiment_salt;
		this._evaluated = false;
		this._in_experiment = false;
		this._inputs = _.clone(inputs);
	}

	in_experiment() {
		return this._in_experiment;
	}

	set_env(new_env) {
		this._env = $.extend(true, {}, new_env);
		return this;
	}

	has(name) {
		return this._env[name];
	}

	get(name, default_val) {
		input_val = this._inputs[name];
		if (!input_val) {
			input_val = default_val;
		}
		env_val = this._env.get(name);
		if (env_val) { 
			return env_val;
		}
		return input_val;
	}

	get_params() {
		if (!this._evaluated) {
			try {
				this.evaluate(this._serialization);
			} catch(err) {
				if (err instanceof StopPlanOutException) {
					this._in_experiment = err.in_experiment;
				}
			}
			this._evaluated = true;
		}
		return this._env.get_params();
	}

	set(name, value) {
		this._env.set(name, value);
		return this;
	}

	set_overrides(overrides) {
		this._env.set_overrides(overrides);
		return this;
	}

	get_overrides() {
		return this._env.get_overrides();
	}

	has_override(name) {
		overrides = this.get_overrides();
		return overrides && overrides[name];
	}

	evaluate(planout_code) {
		if (Object.prototype.toString.call( planout_code ) === '[object Object]' && planout_code.op) {
			return operatorInstance(planout_code).execute(this);
		} else if (Object.prototype.toString.call( planout_code ) === '[object Array]') {
			var self = this;
			return _.map(planout_code, function(obj) {
				return self.evaluate(obj);
			});
		} else {
			return planout_code;
		}
	}

}

export default Interpreter;