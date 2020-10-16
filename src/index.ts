type Values<V> = {
  [K in keyof V]: V[K];
};

type Keys<V> = (keyof V)[];

type Fn<V, R> = (value: V) => R;

type Errors<V, R> = {
  [K in keyof V]: R;
};

type Fns<V, R> = {
  [K in keyof V]?: Fn<V[K], R>[];
};

interface Data<V, R> {
  errors: Errors<V, R>;
  dirty: boolean;
  fns: Fns<V, R>;
  invalid: boolean;
  values: V;
  touched: boolean;
}

type ValidationResult<V, R> = {
  errors: Errors<V, R>;
  invalid: boolean;
};

interface SubmitEvent {
  preventDefault(): void;
}

interface Formable<V, R> extends Data<V, R> {
  next(values: Partial<V>): Formable<V, R>;
  set(values: Partial<V>): void;
  submit<E extends SubmitEvent>(e?: E): Formable<V, R>;
  validate(keys: Keys<V>, values: V, fns: Fns<V, R>): ValidationResult<V, R>;
}

type Args<V, R> = [V, Fns<V, R>?, boolean?, boolean?];

abstract class FormBase<V extends Values<V>, R> implements Formable<V, R> {
  invalid: boolean;
  errors: Errors<V, R>;

  abstract next(values: Partial<V>): Formable<V, R>;
  abstract set(values: Partial<V>): void;
  abstract submit<E extends SubmitEvent>(e?: E): Formable<V, R>;
  abstract validate(keys: Keys<V>, values: V, fns: Fns<V, R>): ValidationResult<V, R>;

  constructor(
    public values: V,
    public fns: Fns<V, R> = {},
    public dirty = false,
    public touched = false,
  ) {
    if (this._isInvalidParam(this.values)) {
      throw new Error('values parameter must be an object');
    }

    if (this._isInvalidParam(this.fns)) {
      throw new Error('fns parameter must be an object');
    }

    this._isInvalidParam = this._isInvalidParam.bind(this);
    this._setValues = this._setValues.bind(this);
    this._markAsTouched = this._markAsTouched.bind(this);
    this._setValidation = this._setValidation.bind(this);
    this.validate = this.validate.bind(this);
    this.set = this.set.bind(this);
    this.submit = this.submit.bind(this);
    this.next = this.next.bind(this);

    this._setValidation();
  }

  protected _isInvalidParam<T>(variable: T): boolean {
    return variable === null || variable === undefined || Array.isArray(variable);
  }

  protected _markAsDirty(): void {
    this.dirty = true;
  }

  protected _preventSubmit<E extends SubmitEvent>(e?: E): void {
    if (e) {
      e.preventDefault();
    }
  }

  protected _markAsTouched(): void {
    this.touched = true;
  }

  protected _setValues(values: Partial<V>): void {
    this.values = {
      ...this.values,
      ...values,
    };
  }

  protected _setValidation(): void {
    const { errors, invalid } = this.validate(
      Object.keys(this.values) as Keys<V>,
      this.values,
      this.fns,
    );

    this.errors = errors;
    this.invalid = invalid;
  }
}

class Form<V extends Values<V>> extends FormBase<V, boolean> {
  constructor(...args: Args<V, boolean>) {
    super(...args);
  }

  /**
   * Builds form logic object.
   */
  static build = <V extends Values<V>>(...args: Args<V, boolean>): Formable<V, boolean> =>
    new Form<V>(...args);

  /**
   * Creates new instance in immutable way.
   */
  next(values: Partial<V>): Formable<V, boolean> {
    this._markAsTouched();
    this._setValues(values);

    return new Form<V>(this.values, this.fns, this.dirty, this.touched);
  }

  /**
   * Changes current instance values.
   */
  set(values: Partial<V>): void {
    if (this._isInvalidParam(values)) {
      throw new Error('values parameter must be an object');
    }

    this._markAsTouched();
    this._setValues(values);
    this._setValidation();
  }

  /**
   * Prevents default behaviour and returns new instance.
   */
  submit<E extends SubmitEvent>(e?: E): Formable<V, boolean> {
    this._preventSubmit(e);
    this._markAsDirty();

    return new Form<V>(this.values, this.fns, this.dirty, this.touched);
  }

  /**
   * Validates values.
   */
  validate(keys: Keys<V>, values: V, fns: Fns<V, boolean>): ValidationResult<V, boolean> {
    const errors = keys.reduce((acc, key) => {
      const value = values[key];

      const result = fns[key] ? fns[key]?.some((fn) => fn(value)) : false;

      return {
        ...acc,
        [key]: result,
      };
    }, {} as Errors<V, boolean>);

    return {
      errors,
      invalid: keys.some((key) => errors[key]),
    };
  }
}

export default Form.build;
