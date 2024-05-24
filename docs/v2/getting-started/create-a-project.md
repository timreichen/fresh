---
description: |
  Create a new Fresh project by running the Fresh project creation tool. This
  scaffolds out the various files and folders a Fresh project needs.
---

New Fresh projects can be created by using the Fresh project creation tool. It
will scaffold out a new project with some example files to get you started.

To create a new project, run:

```sh Terminal
deno run -A -r jsr:@fresh/init
cd fresh-project
deno task start
```

This will scaffold out the new project, then switch into the newly created
directory, and then start the development server.

This will create a directory containing some files and directories. There are 2
files that are strictly necessary to run a Fresh project:

- **`dev.ts`**: This is the development entry point for your project. This is
  the file that you run to start your project. This file doesn't need to be
  called `dev.ts`, but this is the convention.
- **`main.ts`**: This is the production entry point for your project. It is the
  file that you link to Deno Deploy. This file doesn't actually need to be
  `main.ts`, but this is the convention.

A **`deno.json`** file is also created in the project directory. This file does
three things:

- It defines the "imports" field. This is an [import map][import-map] that is
  used to manage dependencies for the project. This allows for easy importing
  and updating of dependencies.
- It registers a "start" [task][task-runner] to run the project without having
  to type a long `deno run` command.
- It configures the project to use `preact` for rendering with JSX.

Two important folders are also created that contain your routes and islands
respectively:

- **`routes/`**: This folder contains all of the routes in your project. The
  names of each file in this folder correspond to the path where that page will
  be accessed. Code inside of this folder is never directly shipped to the
  client. You'll learn more about how routes work in the next section.
- **`islands/`**: This folder contains all of the interactive islands in your
  project. The name of each file corresponds to the name of the island defined
  in that file. Code inside of this folder can be run from both client and
  server. You'll learn more about islands later in this chapter.

Finally a **`static/`** folder is created that contains static files that are
automatically served "as is". [Learn more about static files][static-files].

[import-map]: https://docs.deno.com/runtime/manual/basics/import_maps
[task-runner]: https://deno.land/manual/tools/task_runner
[static-files]: ../concepts/static-files