import { DB } from "../deps.ts";
import { chainResult, failure, isSuccess, Result, success } from "../deps.ts";
import { UserAndEmailAndPassword } from "../authentication/mod.ts";

export type { DB } from "../deps.ts";

export const db = new DB("account.db");

db.query(
  "CREATE TABLE IF NOT EXISTS offer(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, content TEXT, author TEXT)",
);
db.query(
  "CREATE TABLE IF NOT EXISTS account(id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, user TEXT NOT NULL UNIQUE, password TEXT NOT NULL)",
);
export function select(db: DB) {
  return (str: string) => {
    try {
      const rows = [
        ...db.query(
          str,
        ),
      ];
      return success(rows);
    } catch (err) {
      return failure(err);
    }
  };
}

export function insert(db: DB) {
  return (table: string) => {
    return <T extends Record<string, unknown>>(obj: T): Result<T, Error> => {
      try {
        const rows = [...db.query(
          `INSERT INTO ${table}(${Object.keys(obj).join(", ")}) VALUES(:${
            Object.keys(obj).join(", :")
          })`,
          obj,
        )];
        return success(obj);
      } catch (err) {
        return failure(err);
      }
    };
  };
}

export function insertIntoAccount(
  input: UserAndEmailAndPassword,
): Result<UserAndEmailAndPassword, Error> {
  return insert(db)("account")(input);
}

export function selectEmail(
  email: string,
): Result<UserAndEmailAndPassword & { id: number }, Error> {
  return chainResult((row: any[][]) =>
    row.length === 1
      ? success(
        {
          id: row[0][0],
          email: row[0][1],
          user: row[0][2],
          password: row[0][3],
        },
      )
      : failure(Error("No entries were found"))
  )(
    select(db)(
      `SELECT * FROM account WHERE email = '${email}'`,
    ),
  );
}

export function selectPasswordAndUserByEmail(
  email: string,
): Result<{ password: string; user: string }, Error> {
  return chainResult((row: any[][]) =>
    row.length === 1
      ? success({ password: row[0][0], user: row[0][1] })
      : failure(Error("No entries were found"))
  )(
    select(db)(
      `SELECT password, user FROM account WHERE email = '${email}'`,
    ),
  );
}

export function failOnEmailUnavailability(input: UserAndEmailAndPassword) {
  return isSuccess(selectEmail(input.email))
    ? failure(Error("This email address is not available."))
    : success(input);
}

export function failOnUserUnavailability(input: UserAndEmailAndPassword) {
  return isSuccess(selectEmail(input.user))
    ? failure(Error("This username is not available."))
    : success(input);
}
