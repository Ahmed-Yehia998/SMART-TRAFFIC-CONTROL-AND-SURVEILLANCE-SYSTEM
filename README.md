# Smart Traffic Management Database

## Overview

This SQL script creates the PostgreSQL database structure for a smart
traffic management system. It defines the core entities used to
represent road intersections, roads, cameras, vehicles, traffic lights,
pedestrian crossing requests, traffic conditions, and alerts.

The script also configures an administrator role and applies PostgreSQL
Row-Level Security (RLS) to the database tables.

## Database Structure

The schema includes the following tables:

  -----------------------------------------------------------------------
  Table                               Purpose
  ----------------------------------- -----------------------------------
  `intersections`                     Stores intersection names,
                                      locations, and active/inactive
                                      status.

  `roads`                             Stores road names and their
                                      directions (north, south, east, or
                                      west).

  `intersection_road`                 Links roads to intersections,
                                      supporting the many-to-many
                                      relationship between them.

  `cameras`                           Stores camera names, statuses,
                                      types, and associated
                                      intersections.

  `road_cameras`                      Links cameras to roads.

  `vehicles`                          Stores unique vehicle codes and
                                      vehicle types.

  `traffic_light`                     Stores traffic lights and their
                                      current states.

  `pedestrian_requests`               Tracks pedestrian crossing
                                      requests, their statuses, and
                                      request/completion timestamps.

  `traffic_status`                    Stores traffic congestion levels,
                                      vehicle counts, recording
                                      timestamps, and the camera
                                      associated with each record.

  `alerts`                            Stores alert types, descriptions,
                                      statuses, creation timestamps, and
                                      optional related pedestrian
                                      requests.

  `alert_vehicles`                    Links alerts to the vehicles
                                      involved.

  `alert_traffic_light`               Links alerts to traffic lights.

  `traffic_status_traffic_light`      Links traffic status records to
                                      traffic lights.
  -----------------------------------------------------------------------

Identity columns are used for the primary keys of the main entity
tables. Foreign keys define the relationships between entities, while
composite primary keys are used in junction tables to prevent duplicate
links.

## Enumerated Types

The script defines PostgreSQL ENUM types to constrain values for:

-   Intersection status
-   Road direction
-   Camera status and type
-   Vehicle type
-   Traffic-light state
-   Pedestrian-request status
-   Congestion level
-   Alert type and status

These types keep status and category values consistent across the
database.

## Access Control and Row-Level Security

The script:

1.  Creates the `app_admin` role if it does not already exist.
2.  Grants that role usage of the `public` schema, table-level `SELECT`,
    `INSERT`, `UPDATE`, and `DELETE` privileges, and usage/select
    privileges on sequences.
3.  Creates the login role `admin_login` and grants it membership in
    `app_admin`.
4.  Enables and forces Row-Level Security on every table in the schema.
5.  Creates an `FOR ALL` policy for `app_admin` on each table, allowing
    members of that role to perform all table operations through the
    policies.

The final query lists the tables in the `public` schema and displays
whether row security and forced row security are enabled.

## Running the Script

Run the SQL file using a PostgreSQL client or a database administration
tool with a role that has permission to create databases, roles, types,
tables, and policies.

The script begins with:

``` sql
CREATE DATABASE test;
```

Connect to the `test` database before running the remaining statements
if your SQL client does not automatically switch databases after
creating it.

## Configuration Note

The script currently defines the login role with the placeholder
password `ChangeThisPassword`. Replace it with a secure password before
using this setup outside a local or disposable development environment.
Also ensure the `admin_login` role does not already exist, since its
creation is not guarded by an existence check.

## Scope

This SQL file provides the database schema, relationships, enumerated
values, administrator role setup, and RLS policies. It does not define
application APIs, user interfaces, traffic-processing logic, camera
integrations, or automated alert-generation workflows.
