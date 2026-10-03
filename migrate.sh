#!/bin/bash
docker run --rm --network bykstack -v `pwd`/DSL/Liquibase:/liquibase/changelog liquibase/liquibase:4.28 --defaultsFile=/liquibase/changelog/liquibase.properties update
