-- Пользователи
INSERT INTO UserTable(email, login, password)
VALUES
    ('alice@example.com', 'alice', 'password1'),
    ('bob@example.com',   'bob',   'password2');

-- Списки
INSERT INTO ListTable(list_name, list_description, list_owner)
VALUES
    ('Alice Birthday', 'Подарки на день рождения Алисы', 1),
    ('New Year',       'Подарки к Новому году',          1),
    ('Bob Birthday',   'Подарки на день рождения Боба',  2);

-- Айтемы
INSERT INTO ItemTable(name, link, is_divisible, parent_list_id)
VALUES
    ('Книга',            'https://shop.example.com/book1',       FALSE, 1),
    ('Наушники',         'https://shop.example.com/headphones',  FALSE, 1),
    ('Подарочная карта', 'https://shop.example.com/giftcard',    TRUE,  2),
    ('Настольная игра',  'https://shop.example.com/boardgame',   FALSE, 3);

-- Кто что забронировал
INSERT INTO ItemSelections(user_id, item_id)
VALUES
    (2, 1),  -- Bob бронирует подарок из списка Алисы
    (1, 4);  -- Alice бронирует подарок из списка Боба
