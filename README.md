io-form is TypeScript library which allows to build forms in JS/TS projects and also in moddern frameworks like Angular/React/Vue, ...etc.

- **Declarative:** io-form allows to build form logic via simple object definition.
- **Typesafe:** io-form includes great type support.
- **Minimalistic API:** io-form reduces tons of boilerplate.

## Installation

`npm i io-form`

## Examples

- Creating form in `JS`

```js
import Form from 'io-form';

const form = Form({
  email: '',
  username: '',
  code: null,
});

form.set({
  // allows partial update - mutable way
  email: 'polubik1994@gmail.com',
});

const nextForm = form.next({
  // allows partial update - immutable way
  email: 'polubik1994@gmail.com',
});
```

- Creating form in `TS`

```ts
import Form from 'io-form';

interface RegisterFormData {
  email: string;
  username: string;
  code: number | null;
}

const form = Form<RegisterFormData>({
  email: '',
  username: '',
  code: null,
});

form.set({
  // allows partial update - mutable way
  email: 'polubik1994@gmail.com',
});

const nextForm = form.next({
  // allows partial update - immutable way
  email: 'polubik1994@gmail.com',
});
```

- Usage in `React`

```tsx
import React, { useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import Form from 'io-form';

import { Button, InputField } from 'ui';

import { LogInPayload } from 'core/api';

import csx from './LoginForm.scss';

namespace LoginForm {
  export interface Props {
    disabled: boolean;
    onSubmit(credentials: LogInPayload): void;
  }
}

const LoginForm = ({ disabled, onSubmit }: LoginForm.Props) => {
  const [{ dirty, errors, invalid, next, submit, values }, setForm] = useState(
    Form<LogInPayload>(
      {
        login: '',
        password: ''
      },
      {
        login: [(v) => v.length > 2 && v.length < 50],
        password: [(v) => v.length > 2 && v.length < 50]
      }
    )
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const key = e.target.getAttribute('data-key') as keyof LogInPayload;

      setForm(
        next({
          [key]: e.target.value
        })
      );
    },
    [next]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      const form = submit(e);

      if (form.invalid) {
        return;
      }

      onSubmit(form);
    },
    [values]
  );

  return (
    <form className={csx.loginForm} onSubmit={handleSubmit}>
      <InputField
        data-key="login"
        label="Login"
        placeholder="Login..."
        error={dirty ? (errors.login ? 'Invalid login format' : '') : ''}
        value={values.login}
        onChange={handleChange}
      />

      <InputField
        data-key="password"
        type="password"
        label="Password"
        placeholder="Password..."
        error={dirty ? (errors.login ? 'Invalid password format' : '') : ''}
        value={values.password}
        onChange={handleChange}
      />

      <div className={csx.loginActions}>
        {disabled || <NavLink to="/forgotten-password">Forgot password ?</NavLink>}
      </div>

      <Button type="submit" disabled={disabled || (dirty && invalid)}>
        SUBMIT
      </Button>
    </form>
  );
};

export default LoginForm;

```

### License

io-form is [MIT licensed](./license).
