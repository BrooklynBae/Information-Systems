BEGIN;

CREATE EXTENSION IF NOT EXISTS plpgsql;

CREATE TABLE IF NOT EXISTS UserTable (
    id       SERIAL       PRIMARY KEY,
    email    VARCHAR(100) NOT NULL UNIQUE,
    login    VARCHAR(50)  NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS ListTable (
    list_id          SERIAL        PRIMARY KEY,
    list_name        VARCHAR(50)   NOT NULL,
    list_description VARCHAR(1000) NOT NULL,
    list_owner       INT           NOT NULL REFERENCES UserTable(id)
);

CREATE TABLE IF NOT EXISTS ItemTable (
    id             SERIAL         PRIMARY KEY,
    name           VARCHAR(100)   NOT NULL,
    link           VARCHAR(33000) NOT NULL,
    is_divisible   BOOLEAN        NOT NULL,
    parent_list_id INT            NOT NULL REFERENCES ListTable(list_id)
);

-- M:N между пользователями и айтемами (кто что выбрал/забронировал)
CREATE TABLE IF NOT EXISTS ItemSelections (
    user_id INT NOT NULL REFERENCES UserTable(id),
    item_id INT NOT NULL REFERENCES ItemTable(id),
    PRIMARY KEY (user_id, item_id)
);

-- Для getAllOwnersLists(ownerId)
CREATE INDEX IF NOT EXISTS idx_list_owner
    ON ListTable(list_owner);

-- Для getAllWishlistItems(parentListId)
CREATE INDEX IF NOT EXISTS idx_item_parent_list_id
    ON ItemTable(parent_list_id);

-- Для быстрых выборок по связкам
CREATE INDEX IF NOT EXISTS idx_item_selections_user
    ON ItemSelections(user_id);

CREATE INDEX IF NOT EXISTS idx_item_selections_item
    ON ItemSelections(item_id);

-- Пользователь

CREATE OR REPLACE FUNCTION fn_insert_user_pl(
    p_email VARCHAR,
    p_login VARCHAR,
    p_pass  VARCHAR
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_id INT;
BEGIN
    INSERT INTO UserTable(email, login, password)
    VALUES (p_email, p_login, p_pass)
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_user_by_email_pl(
    p_email VARCHAR
)
RETURNS TABLE (
    id       INT,
    email    VARCHAR,
    login    VARCHAR,
    password VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.email, u.login, u.password
    FROM UserTable AS u
    WHERE u.email = p_email;
END;
$$;

-- Списки

CREATE OR REPLACE FUNCTION fn_add_list_pl(
    p_name        VARCHAR,
    p_description VARCHAR,
    p_owner_id    INT
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_list_id INT;
BEGIN
    INSERT INTO ListTable(list_name, list_description, list_owner)
    VALUES (p_name, p_description, p_owner_id)
    RETURNING list_id INTO v_list_id;

    RETURN v_list_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_lists_by_owner_pl(
    p_owner_id INT
)
RETURNS TABLE (
    list_id          INT,
    list_name        VARCHAR,
    list_description VARCHAR,
    list_owner       INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT l.list_id, l.list_name, l.list_description, l.list_owner
    FROM ListTable AS l
    WHERE l.list_owner = p_owner_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_update_list_pl(
    p_list_id      INT,
    p_owner_id     INT,
    p_name         VARCHAR,
    p_description  VARCHAR
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE ListTable
    SET list_name        = p_name,
        list_description = p_description
    WHERE list_id   = p_list_id
      AND list_owner = p_owner_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_delete_list_pl(
    p_list_id  INT,
    p_owner_id INT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM ListTable
    WHERE list_id = p_list_id
      AND list_owner = p_owner_id;
END;
$$;

-- Айтемы

CREATE OR REPLACE FUNCTION fn_add_item_pl(
    p_name           VARCHAR,
    p_link           VARCHAR,
    p_is_divisible   BOOLEAN,
    p_parent_list_id INT
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_item_id INT;
BEGIN
    INSERT INTO ItemTable(name, link, is_divisible, parent_list_id)
    VALUES (p_name, p_link, p_is_divisible, p_parent_list_id)
    RETURNING id INTO v_item_id;

    RETURN v_item_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_items_by_list_pl(
    p_parent_list_id INT
)
RETURNS TABLE (
    id             INT,
    name           VARCHAR,
    link           VARCHAR,
    is_divisible   BOOLEAN,
    parent_list_id INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT i.id, i.name, i.link, i.is_divisible, i.parent_list_id
    FROM ItemTable AS i
    WHERE i.parent_list_id = p_parent_list_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_update_item_pl(
    p_item_id        INT,
    p_parent_list_id INT,
    p_name           VARCHAR,
    p_link           VARCHAR,
    p_is_divisible   BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE ItemTable
    SET name         = p_name,
        link         = p_link,
        is_divisible = p_is_divisible
    WHERE id             = p_item_id
      AND parent_list_id = p_parent_list_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_delete_item_pl(
    p_item_id        INT,
    p_parent_list_id INT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM ItemTable
    WHERE id             = p_item_id
      AND parent_list_id = p_parent_list_id;
END;
$$;

-- Нормализуем email (lower/trim) перед вставкой/обновлением
CREATE OR REPLACE FUNCTION trg_normalize_user_email()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.email := lower(trim(NEW.email));
    RETURN NEW;
END;
$$;

CREATE TRIGGER normalize_user_email
BEFORE INSERT OR UPDATE ON UserTable
FOR EACH ROW
EXECUTE FUNCTION trg_normalize_user_email();

-- Запрет удалять список, если в нём ещё есть айтемы
CREATE OR REPLACE FUNCTION trg_prevent_delete_list_if_items_exist()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM ItemTable i
        WHERE i.parent_list_id = OLD.list_id
    ) THEN
        RAISE EXCEPTION 'Нельзя удалить список %, пока в нём есть айтемы', OLD.list_id;
    END IF;

    RETURN OLD;
END;
$$;

CREATE TRIGGER prevent_delete_list_if_items_exist
BEFORE DELETE ON ListTable
FOR EACH ROW
EXECUTE FUNCTION trg_prevent_delete_list_if_items_exist();

COMMIT;
