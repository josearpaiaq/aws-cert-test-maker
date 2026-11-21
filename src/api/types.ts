import type { operations } from './schema';

type Json<T> = T extends { content: { 'application/json': infer B } } ? B : never;

export type TokenResponse = Json<operations['AuthController_login_v1']['responses'][200]>;
export type Me = Json<operations['UsersController_me_v1']['responses'][200]>;
export type Credentials = NonNullable<
  operations['AuthController_register_v1']['requestBody']
>['content']['application/json'];
