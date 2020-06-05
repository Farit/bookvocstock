#!/usr/bin/env bash
cat ./app.js  > ../../static/js/universe.js
cat ./base/views/base.js >> ../../static/js/universe.js
cat ./base/views/account.js >> ../../static/js/universe.js
cat ./base/models/authreg.js >> ../../static/js/universe.js
cat ./base/views/authreg.js  >> ../../static/js/universe.js

cat ./text/models/text.js >> ../../static/js/universe.js
cat ./text/models/data.js >> ../../static/js/universe.js
cat ./text/models/analytics.js >> ../../static/js/universe.js

cat ./spinners/views.js  >> ../../static/js/universe.js

cat ./signup/model.js  >> ../../static/js/universe.js
cat ./signup/view.js  >> ../../static/js/universe.js
cat ./login/model.js  >> ../../static/js/universe.js
cat ./login/view.js  >> ../../static/js/universe.js
cat ./pass_recovery/model.js  >> ../../static/js/universe.js
cat ./pass_recovery/view.js  >> ../../static/js/universe.js
cat ./pass_reset/model.js  >> ../../static/js/universe.js
cat ./pass_reset/view.js  >> ../../static/js/universe.js

cat ./library/collection.js  >> ../../static/js/universe.js
cat ./library/subviews/table.js  >> ../../static/js/universe.js
cat ./library/subviews/table_row.js  >> ../../static/js/universe.js
cat ./library/subviews/pagination.js  >> ../../static/js/universe.js
cat ./library/subviews/upload.js  >> ../../static/js/universe.js
cat ./library/view.js  >> ../../static/js/universe.js

cat ./text/subviews/words_list.js  >> ../../static/js/universe.js
cat ./text/subviews/word.js  >> ../../static/js/universe.js
cat ./text/subviews/visualization/view.js  >> ../../static/js/universe.js
cat ./text/subviews/visualization/by_stage.js  >> ../../static/js/universe.js
cat ./text/subviews/visualization/by_occur.js  >> ../../static/js/universe.js
cat ./text/view.js  >> ../../static/js/universe.js

cat ./vocabulary/model.js  >> ../../static/js/universe.js
cat ./vocabulary/subviews/visualization.js  >> ../../static/js/universe.js
cat ./vocabulary/view.js  >> ../../static/js/universe.js
