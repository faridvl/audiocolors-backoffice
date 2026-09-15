import Cookies from 'js-cookie';
import { GetServerSidePropsContext, NextPageContext } from 'next';

const TOKEN_KEY = 'SESSION_ACCESS_TOKEN';
const USER_NAME_KEY = 'SESSION_USER_NAME';

type CookieConfig = Cookies.CookieAttributes;

export class CookiesManager {
  private static readonly config: CookieConfig = {
    expires: 7,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  };

  static setSession(token: string, userName: string): void {
    Cookies.set(TOKEN_KEY, token, this.config);
    Cookies.set(USER_NAME_KEY, userName, this.config);
  }

  static getAccessToken(context?: GetServerSidePropsContext | NextPageContext): string | undefined {
    return this.getCookieByKey(TOKEN_KEY, context);
  }

  static getUserName(context?: GetServerSidePropsContext | NextPageContext): string | undefined {
    return this.getCookieByKey(USER_NAME_KEY, context);
  }

  private static getCookieByKey(
    key: string,
    context?: GetServerSidePropsContext | NextPageContext,
  ): string | undefined {
    if (context?.req?.headers?.cookie) {
      const cookieHeader = context.req.headers.cookie;
      const cookies = Object.fromEntries(
        cookieHeader.split('; ').map((cookie) => {
          const [name, ...value] = cookie.split('=');
          return [name.trim(), value.join('=')];
        }),
      );
      return cookies[key];
    }

    return Cookies.get(key);
  }

  static clearAll(): void {
    Cookies.remove(TOKEN_KEY, { path: '/' });
    Cookies.remove(USER_NAME_KEY, { path: '/' });
  }
}
