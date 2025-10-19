# Database Schema

Using a PostgreSQL database to handle the relationships.

**Table Relationships**:

- A `user` can be the author of many `pages` and `comments`.
- A `category` can have many `pages`.
- A `page` can have many `comments`.
- The `links` table connects a `source_page` to a `target_page`, creating the graph structure.
- A `comment` can have a `parent_comment` to create threads.

### Users

Stores information about all users, managed primarily by Auth.js. Used to handle _authentication_, _permissions_ (roles), and _attribute content_ like pages and comments to a specific person.

| Field        | Type          | Description                                                  |
| ------------ | ------------- | ------------------------------------------------------------ |
| `id`         | `UUID`        | **PK**. A unique identifier for the user.                    |
| `name`       | `TEXT`        | The users' display name.                                     |
| `email`      | `EMAIL`       | **UNIQUE**. The user's email address, used for login.        |
| `role`       | `USER_ROLE`   | **Default: 'USER'**. The user's role for permission control. |
| `created_at` | `TIMESTAMPTZ` | **Default: `now()`**. When the user account was created.     |

```SQL
CREATE TYPE USER_ROLE AS ENUM ('USER', 'ADMIN');
```

### Categories

Defines different categories a page can belong to. Used to classify pages for coloring nodes in the constellation and for filtering

| Field       | Type   | Description                                                                   |
| ----------- | ------ | ----------------------------------------------------------------------------- |
| `id`        | `UUID` | **PK**. A unique identifier for the category.                                 |
| `name`      | `TEXT` | **UNIQUE**. The name of the category (e.g., "Data Structures", "Frameworks"). |
| `color_hex` | `TEXT` | The hex color code (e.g., "#3b82f6") for styling graph nodes.                 |

### Pages

The central table of the application, holding the content for each topic. Used to store the main content, title, and metadata for every page in the knowledge base.

| Field         | Type          | Description                                                                                |
| ------------- | ------------- | ------------------------------------------------------------------------------------------ |
| `id`          | `UUID`        | **PK**. A unique identifier for the page.                                                  |
| `title`       | `TEXT`        | **NOT NULL**. The human-readable title of the page.                                        |
| `slug`        | `TEXT`        | **UNIQUE, NOT NULL**. The URL-friendly version of the title (e.g., "singly-linked-lists"). |
| `content`     | `TEXT`        | The full MDX content for the page.                                                         |
| `author_id`   | `UUID`        | **FK to `users.id`**. The user who created the page.                                       |
| `category_id` | `UUID`        | **FK to `categories.id`**. The category this page belongs to.                              |
| `created_at`  | `TIMESTAMPTZ` | **Default `now()`**. When the page was first created.                                      |
| `updated_at`  | `TIMESTAMPTZ` | **Default `now()`**. When the page was last updated.                                       |

```SQL
author_id UUID REFERENCES users(id) ON DELETE SET NULL,
category_id UUID REFERENCES categories(id) ON DELETE RESTRICT
```

### Links

A join table that maps the many-to-many relationship between pages. Used to efficiently store and query the connections between pages to build the constellation graph.

| Field            | Type   | Description                                                             |
| ---------------- | ------ | ----------------------------------------------------------------------- |
| `source_page_id` | `UUID` | **Composite PK, FK to `pages.id`**. The page where the link originates. |
| `target_page_id` | `UUID` | **Composite PK, FK to `pages.id`**. The page the link points to.        |

```SQL
source_page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
target_page_id UUID REFERENCES pages(id) ON DELETE CASCADE
```

### Comments

Stores all comments on pages. Used to enable discussion and suggestions on pages. The self-referencing `parent_comment_id` allows for nested/threaded replies.

| Field               | Type             | Description                                                                        |
| ------------------- | ---------------- | ---------------------------------------------------------------------------------- |
| `id`                | `UUID`           | **PK**. A unique identifier for the comment.                                       |
| `content`           | `TEXT`           | **NOT NULL**. The text of the comment.                                             |
| `user_id`           | `UUID`           | **FK to `users.id`**. The author of the comment.                                   |
| `page_id`           | `UUID`           | **FK to `pages.id`**. The page the comment is on.                                  |
| `parent_comment_id` | `UUID`           | **FK to `comments.id`**. For threaded replies. `NULL` if it's a top-level comment. |
| `status`            | `COMMENT_STATUS` | **Default: 'OPEN'**. The comment's status.                                         |
| `created_at`        | `TIMESTAMPTZ`    | **Default: `now()`**. When the comment was posted.                                 |

```SQL
CREATE TYPE COMMENT_STATUS AS ENUM ('OPEN', 'RESOLVED');

user_id UUID REFERENCES users(id) ON DELETE SET NULL
page_id UUID REFERENCES pages(id) ON DELETE CASCADE

UPDATE comments
SET
	content = '[comment deleted by user]',
	user_id = NULL
WHERE id = '...';
```

### Definitions

Stores terms and explanations for the hover-over definition feature. Used to provide a centralized place for storing reusable definitions that can be injected into any page via an MDX component.

| Field         | Type   | Description                                                            |
| ------------- | ------ | ---------------------------------------------------------------------- |
| `id`          | `UUID` | **PK**. A unique identifier for the definition.                        |
| `term`        | `TEXT` | **UNIQUE, NOT NULL**. The word or acronym to be defined (e.g., "API"). |
| `explanation` | `TEXT` | **NOT NULL**. The content of the definition pop-up.                    |
