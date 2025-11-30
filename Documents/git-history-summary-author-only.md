
### refactor: Relocate Firestore schema retrieval utility
**Author:** darklorddad
**Date:** Mon Nov 17 11:27:20 2025 +0800



 utilities/{crawl_schema => }/crawl_schema.py | 0
 1 file changed, 0 insertions(+), 0 deletions(-)

### Merge branch 'main' of https://github.com/Uwe1209/SPS
**Author:** darklorddad
**Date:** Mon Nov 17 11:25:56 2025 +0800



### fix: Update admin dashboard and user profile validation
**Author:** darklorddad
**Date:** Mon Nov 17 08:30:16 2025 +0800



 SmartPlant/src/admin/AdminContext.js |  8 +++++---
 SmartPlant/src/pages/EditProfile.js  | 40 +++++++++++++++++++++++-----------------
 2 files changed, 28 insertions(+), 20 deletions(-)

### fix: Correct admin navigation target in UserLogin
**Author:** darklorddad
**Date:** Mon Nov 17 08:24:19 2025 +0800



 SmartPlant/src/pages/UserLogin.js | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### fix: Check user `is_active` flag from user collection for login flows
**Author:** darklorddad
**Date:** Mon Nov 17 08:17:26 2025 +0800



 SmartPlant/src/firebase/login_register/user_login.js |  9 ++++-----
 SmartPlant/src/pages/LoginSelection.js               | 16 +++++++---------
 2 files changed, 11 insertions(+), 14 deletions(-)

### fix: Prevent login for deactivated users by checking `is_active` flag
**Author:** darklorddad
**Date:** Mon Nov 17 08:14:15 2025 +0800



 SmartPlant/src/firebase/login_register/user_login.js |  7 ++++++-
 SmartPlant/src/pages/LoginSelection.js               | 12 +++++++++++-
 2 files changed, 17 insertions(+), 2 deletions(-)

### docs: Add initial project scope document for SmartPlant Sarawak
**Author:** darklorddad
**Date:** Mon Nov 17 08:05:37 2025 +0800



 Documents/Resources/Assessment/Information/Project-Scope_COS30049_v2.md | 134 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 134 insertions(+)

### docs: Remove old project proposal document
**Author:** darklorddad
**Date:** Mon Nov 17 07:54:49 2025 +0800



 Documents/COS30029-Complete-Project_Proposal.docx | Bin 2211365 -> 0 bytes
 1 file changed, 0 insertions(+), 0 deletions(-)

### refactor: Renamed files and organised file structure
**Author:** darklorddad
**Date:** Mon Nov 17 07:50:31 2025 +0800



 Dataset/iNaturalist/iNaturalist-manifest.md                               |   130 ++
 Dataset/iNaturalist/inaturalist_manager.py                                |   911 +++++++++
 Dataset/iNaturalist/unzip_ficus.py                                        |    44 +
 utilities/AutoTrain-requirements.txt                                      |    49 +
 utilities/Dataset-Pulong-Tau-National-Park/Dataset-balance-manifest.md    |    22 +
 utilities/Dataset-Pulong-Tau-National-Park/Dataset-class-distribution.png |   Bin 0 -> 59734 bytes
 utilities/Dataset-Pulong-Tau-National-Park/Train-manifest.md              |  1169 ++++++++++++
 utilities/Dataset-Pulong-Tau-National-Park/Validate-manifest.md           |   316 ++++
 utilities/Dataset-iNaturalist-SMOTE-RUS-Median/Train-manifest.md          |  6791 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 utilities/Dataset-iNaturalist-SMOTE-RUS-Median/Validate-manifest.md       |  5176 +++++++++++++++++++++++++++++++++++++++++++++++++++
 utilities/Dataset-iNaturalist/Preprocessed/Preprocessed-manifest.txt      |  1197 ++++++++++++
 utilities/Dataset-iNaturalist/Train-manifest.md                           | 16091 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 utilities/Dataset-iNaturalist/Validate-manifest.md                        |  5176 +++++++++++++++++++++++++++++++++++++++++++++++++++
 utilities/app.py                                                          |   272 +++
 utilities/autotrain/__init__.py                                           |    76 +
 utilities/autotrain/app/__init__.py                                       |     0
 utilities/autotrain/app/api_routes.py                                     |   783 ++++++++
 utilities/autotrain/app/app.py                                            |    43 +
 utilities/autotrain/app/colab.py                                          |   402 ++++
 utilities/autotrain/app/db.py                                             |    62 +
 utilities/autotrain/app/models.py                                         |   357 ++++
 utilities/autotrain/app/oauth.py                                          |   172 ++
 utilities/autotrain/app/params.py                                         |   739 ++++++++
 utilities/autotrain/app/static/logo.png                                   |   Bin 0 -> 45750 bytes
 utilities/autotrain/app/static/scripts/fetch_data_and_update_models.js    |    34 +
 utilities/autotrain/app/static/scripts/listeners.js                       |   190 ++
 utilities/autotrain/app/static/scripts/logs.js                            |    62 +
 utilities/autotrain/app/static/scripts/poll.js                            |    70 +
 utilities/autotrain/app/static/scripts/utils.js                           |   182 ++
 utilities/autotrain/app/templates/duplicate.html                          |    34 +
 utilities/autotrain/app/templates/error.html                              |    32 +
 utilities/autotrain/app/templates/index.html                              |   697 +++++++
 utilities/autotrain/app/templates/login.html                              |    55 +
 utilities/autotrain/app/training_api.py                                   |   109 ++
 utilities/autotrain/app/ui_routes.py                                      |   809 ++++++++
 utilities/autotrain/app/utils.py                                          |   180 ++
 utilities/autotrain/backends/__init__.py                                  |     0
 utilities/autotrain/backends/base.py                                      |   163 ++
 utilities/autotrain/backends/endpoints.py                                 |    86 +
 utilities/autotrain/backends/local.py                                     |    26 +
 utilities/autotrain/backends/ngc.py                                       |   107 ++
 utilities/autotrain/backends/nvcf.py                                      |   203 ++
 utilities/autotrain/backends/spaces.py                                    |    93 +
 utilities/autotrain/cli/__init__.py                                       |    13 +
 utilities/autotrain/cli/autotrain.py                                      |    72 +
 utilities/autotrain/cli/run_api.py                                        |    70 +
 utilities/autotrain/cli/run_app.py                                        |   169 ++
 utilities/autotrain/cli/run_extractive_qa.py                              |   105 ++
 utilities/autotrain/cli/run_image_classification.py                       |   113 ++
 utilities/autotrain/cli/run_image_regression.py                           |   113 ++
 utilities/autotrain/cli/run_llm.py                                        |   141 ++
 utilities/autotrain/cli/run_object_detection.py                           |   113 ++
 utilities/autotrain/cli/run_sent_tranformers.py                           |   113 ++
 utilities/autotrain/cli/run_seq2seq.py                                    |    97 +
 utilities/autotrain/cli/run_setup.py                                      |    53 +
 utilities/autotrain/cli/run_spacerunner.py                                |   143 ++
 utilities/autotrain/cli/run_tabular.py                                    |   106 ++
 utilities/autotrain/cli/run_text_classification.py                        |   106 ++
 utilities/autotrain/cli/run_text_regression.py                            |   106 ++
 utilities/autotrain/cli/run_token_classification.py                       |   106 ++
 utilities/autotrain/cli/run_tools.py                                      |    99 +
 utilities/autotrain/cli/run_vlm.py                                        |   111 ++
 utilities/autotrain/cli/utils.py                                          |   178 ++
 utilities/autotrain/client.py                                             |   294 +++
 utilities/autotrain/commands.py                                           |   516 ++++++
 utilities/autotrain/config.py                                             |     4 +
 utilities/autotrain/dataset.py                                            |   812 ++++++++
 utilities/autotrain/help.py                                               |    81 +
 utilities/autotrain/logging.py                                            |    61 +
 utilities/autotrain/params.py                                             |    12 +
 utilities/autotrain/parser.py                                             |   229 +++
 utilities/autotrain/preprocessor/__init__.py                              |     0
 utilities/autotrain/preprocessor/tabular.py                               |   273 +++
 utilities/autotrain/preprocessor/text.py                                  |   828 +++++++++
 utilities/autotrain/preprocessor/vision.py                                |   565 ++++++
 utilities/autotrain/preprocessor/vlm.py                                   |   224 +++
 utilities/autotrain/project.py                                            |   563 ++++++
 utilities/autotrain/tasks.py                                              |    36 +
 utilities/autotrain/tests/test_cli.py                                     |     0
 utilities/autotrain/tests/test_dummy.py                                   |     2 +
 utilities/autotrain/tools/__init__.py                                     |     0
 utilities/autotrain/tools/convert_to_kohya.py                             |    23 +
 utilities/autotrain/tools/merge_adapter.py                                |    68 +
 utilities/autotrain/trainers/__init__.py                                  |     0
 utilities/autotrain/trainers/clm/__init__.py                              |     0
 utilities/autotrain/trainers/clm/__main__.py                              |    53 +
 utilities/autotrain/trainers/clm/callbacks.py                             |    61 +
 utilities/autotrain/trainers/clm/params.py                                |   140 ++
 utilities/autotrain/trainers/clm/train_clm_default.py                     |   114 ++
 utilities/autotrain/trainers/clm/train_clm_dpo.py                         |   118 ++
 utilities/autotrain/trainers/clm/train_clm_orpo.py                        |    57 +
 utilities/autotrain/trainers/clm/train_clm_reward.py                      |   124 ++
 utilities/autotrain/trainers/clm/train_clm_sft.py                         |    56 +
 utilities/autotrain/trainers/clm/utils.py                                 |   993 ++++++++++
 utilities/autotrain/trainers/common.py                                    |   386 ++++
 utilities/autotrain/trainers/extractive_question_answering/__init__.py    |     0
 utilities/autotrain/trainers/extractive_question_answering/__main__.py    |   263 +++
 utilities/autotrain/trainers/extractive_question_answering/dataset.py     |   121 ++
 utilities/autotrain/trainers/extractive_question_answering/params.py      |    76 +
 utilities/autotrain/trainers/extractive_question_answering/utils.py       |   396 ++++
 utilities/autotrain/trainers/generic/__init__.py                          |     0
 utilities/autotrain/trainers/generic/__main__.py                          |    58 +
 utilities/autotrain/trainers/generic/params.py                            |    36 +
 utilities/autotrain/trainers/generic/utils.py                             |   201 ++
 utilities/autotrain/trainers/image_classification/__init__.py             |     0
 utilities/autotrain/trainers/image_classification/__main__.py             |   252 +++
 utilities/autotrain/trainers/image_classification/dataset.py              |    46 +
 utilities/autotrain/trainers/image_classification/params.py               |    70 +
 utilities/autotrain/trainers/image_classification/utils.py                |   232 +++
 utilities/autotrain/trainers/image_regression/__init__.py                 |     0
 utilities/autotrain/trainers/image_regression/__main__.py                 |   226 +++
 utilities/autotrain/trainers/image_regression/dataset.py                  |    42 +
 utilities/autotrain/trainers/image_regression/params.py                   |    70 +
 utilities/autotrain/trainers/image_regression/utils.py                    |   174 ++
 utilities/autotrain/trainers/object_detection/__init__.py                 |     0
 utilities/autotrain/trainers/object_detection/__main__.py                 |   236 +++
 utilities/autotrain/trainers/object_detection/dataset.py                  |    60 +
 utilities/autotrain/trainers/object_detection/params.py                   |    74 +
 utilities/autotrain/trainers/object_detection/utils.py                    |   270 +++
 utilities/autotrain/trainers/sent_transformers/__init__.py                |     0
 utilities/autotrain/trainers/sent_transformers/__main__.py                |   251 +++
 utilities/autotrain/trainers/sent_transformers/params.py                  |    84 +
 utilities/autotrain/trainers/sent_transformers/utils.py                   |   159 ++
 utilities/autotrain/trainers/seq2seq/__init__.py                          |     0
 utilities/autotrain/trainers/seq2seq/__main__.py                          |   279 +++
 utilities/autotrain/trainers/seq2seq/dataset.py                           |    41 +
 utilities/autotrain/trainers/seq2seq/params.py                            |    88 +
 utilities/autotrain/trainers/seq2seq/utils.py                             |    98 +
 utilities/autotrain/trainers/tabular/__init__.py                          |     0
 utilities/autotrain/trainers/tabular/__main__.py                          |   409 ++++
 utilities/autotrain/trainers/tabular/params.py                            |    52 +
 utilities/autotrain/trainers/tabular/utils.py                             |   546 ++++++
 utilities/autotrain/trainers/text_classification/__init__.py              |     0
 utilities/autotrain/trainers/text_classification/__main__.py              |   239 +++
 utilities/autotrain/trainers/text_classification/dataset.py               |    65 +
 utilities/autotrain/trainers/text_classification/params.py                |    72 +
 utilities/autotrain/trainers/text_classification/utils.py                 |   179 ++
 utilities/autotrain/trainers/text_regression/__init__.py                  |     0
 utilities/autotrain/trainers/text_regression/__main__.py                  |   229 +++
 utilities/autotrain/trainers/text_regression/dataset.py                   |    66 +
 utilities/autotrain/trainers/text_regression/params.py                    |    72 +
 utilities/autotrain/trainers/text_regression/utils.py                     |   118 ++
 utilities/autotrain/trainers/token_classification/__init__.py             |     0
 utilities/autotrain/trainers/token_classification/__main__.py             |   235 +++
 utilities/autotrain/trainers/token_classification/dataset.py              |    65 +
 utilities/autotrain/trainers/token_classification/params.py               |    72 +
 utilities/autotrain/trainers/token_classification/utils.py                |    98 +
 utilities/autotrain/trainers/vlm/__init__.py                              |     0
 utilities/autotrain/trainers/vlm/__main__.py                              |    37 +
 utilities/autotrain/trainers/vlm/dataset.py                               |     0
 utilities/autotrain/trainers/vlm/params.py                                |   101 +
 utilities/autotrain/trainers/vlm/train_vlm_generic.py                     |    98 +
 utilities/autotrain/trainers/vlm/utils.py                                 |   329 ++++
 utilities/autotrain/utils.py                                              |    82 +
 utilities/crawl_schema/crawl_schema.py                                    |    29 +
 utilities/gradio_wrapper.py                                               |   950 ++++++++++
 utilities/launch_autotrain.py                                             |    15 +
 utilities/requirements.txt                                                |    50 +
 utilities/utils.py                                                        |    82 +
 159 files changed, 60123 insertions(+)

### refactor: Remove unused files and update gitignore
**Author:** darklorddad
**Date:** Mon Nov 17 07:49:48 2025 +0800



 .gitignore                                                                 |    20 +-
 App.js                                                                     |   105 --
 SmartPlant/package-lock.json                                               |     2 +-
 SmartPlant/package.json                                                    |     2 +-
 SmartPlant/src/config.js                                                   |     3 +-
 SmartPlant/tabs/Tabs.js                                                    |     2 +-
 app.json                                                                   |    48 -
 backend/controllers/userController.js                                      |    18 -
 backend/node_modules/.package-lock.json                                    |    68 -
 backend/routes/user.js                                                     |     7 -
 core/AutoTrain-requirements.txt                                            |    49 -
 core/Dataset-iNaturalist/Dataset-iNaturalist-train.md                      | 16091 -------------------------------------------------------------------------------------------------------------------------------------------------------------
 core/Dataset-iNaturalist/Dataset-iNaturalist-validate.md                   |  5176 ---------------------------------------------------
 core/Dataset-iNaturalist/Preprocessed/Dataset-iNaturalist-preprocessed.txt |  1197 ------------
 core/app.py                                                                |   272 ---
 core/autotrain/__init__.py                                                 |    76 -
 core/autotrain/app/__init__.py                                             |     0
 core/autotrain/app/api_routes.py                                           |   783 --------
 core/autotrain/app/app.py                                                  |    43 -
 core/autotrain/app/colab.py                                                |   402 ----
 core/autotrain/app/db.py                                                   |    62 -
 core/autotrain/app/models.py                                               |   357 ----
 core/autotrain/app/oauth.py                                                |   172 --
 core/autotrain/app/params.py                                               |   739 --------
 core/autotrain/app/static/logo.png                                         |   Bin 45750 -> 0 bytes
 core/autotrain/app/static/scripts/fetch_data_and_update_models.js          |    34 -
 core/autotrain/app/static/scripts/listeners.js                             |   190 --
 core/autotrain/app/static/scripts/logs.js                                  |    62 -
 core/autotrain/app/static/scripts/poll.js                                  |    70 -
 core/autotrain/app/static/scripts/utils.js                                 |   182 --
 core/autotrain/app/templates/duplicate.html                                |    34 -
 core/autotrain/app/templates/error.html                                    |    32 -
 core/autotrain/app/templates/index.html                                    |   697 -------
 core/autotrain/app/templates/login.html                                    |    55 -
 core/autotrain/app/training_api.py                                         |   109 --
 core/autotrain/app/ui_routes.py                                            |   809 --------
 core/autotrain/app/utils.py                                                |   180 --
 core/autotrain/backends/__init__.py                                        |     0
 core/autotrain/backends/base.py                                            |   163 --
 core/autotrain/backends/endpoints.py                                       |    86 -
 core/autotrain/backends/local.py                                           |    26 -
 core/autotrain/backends/ngc.py                                             |   107 --
 core/autotrain/backends/nvcf.py                                            |   203 --
 core/autotrain/backends/spaces.py                                          |    93 -
 core/autotrain/cli/__init__.py                                             |    13 -
 core/autotrain/cli/autotrain.py                                            |    72 -
 core/autotrain/cli/run_api.py                                              |    70 -
 core/autotrain/cli/run_app.py                                              |   169 --
 core/autotrain/cli/run_extractive_qa.py                                    |   105 --
 core/autotrain/cli/run_image_classification.py                             |   113 --
 core/autotrain/cli/run_image_regression.py                                 |   113 --
 core/autotrain/cli/run_llm.py                                              |   141 --
 core/autotrain/cli/run_object_detection.py                                 |   113 --
 core/autotrain/cli/run_sent_tranformers.py                                 |   113 --
 core/autotrain/cli/run_seq2seq.py                                          |    97 -
 core/autotrain/cli/run_setup.py                                            |    53 -
 core/autotrain/cli/run_spacerunner.py                                      |   143 --
 core/autotrain/cli/run_tabular.py                                          |   106 --
 core/autotrain/cli/run_text_classification.py                              |   106 --
 core/autotrain/cli/run_text_regression.py                                  |   106 --
 core/autotrain/cli/run_token_classification.py                             |   106 --
 core/autotrain/cli/run_tools.py                                            |    99 -
 core/autotrain/cli/run_vlm.py                                              |   111 --
 core/autotrain/cli/utils.py                                                |   178 --
 core/autotrain/client.py                                                   |   294 ---
 core/autotrain/commands.py                                                 |   516 ------
 core/autotrain/config.py                                                   |     4 -
 core/autotrain/dataset.py                                                  |   812 --------
 core/autotrain/help.py                                                     |    81 -
 core/autotrain/logging.py                                                  |    61 -
 core/autotrain/params.py                                                   |    12 -
 core/autotrain/parser.py                                                   |   229 ---
 core/autotrain/preprocessor/__init__.py                                    |     0
 core/autotrain/preprocessor/tabular.py                                     |   273 ---
 core/autotrain/preprocessor/text.py                                        |   828 ---------
 core/autotrain/preprocessor/vision.py                                      |   565 ------
 core/autotrain/preprocessor/vlm.py                                         |   224 ---
 core/autotrain/project.py                                                  |   563 ------
 core/autotrain/tasks.py                                                    |    36 -
 core/autotrain/tests/test_cli.py                                           |     0
 core/autotrain/tests/test_dummy.py                                         |     2 -
 core/autotrain/tools/__init__.py                                           |     0
 core/autotrain/tools/convert_to_kohya.py                                   |    23 -
 core/autotrain/tools/merge_adapter.py                                      |    68 -
 core/autotrain/trainers/__init__.py                                        |     0
 core/autotrain/trainers/clm/__init__.py                                    |     0
 core/autotrain/trainers/clm/__main__.py                                    |    53 -
 core/autotrain/trainers/clm/callbacks.py                                   |    61 -
 core/autotrain/trainers/clm/params.py                                      |   140 --
 core/autotrain/trainers/clm/train_clm_default.py                           |   114 --
 core/autotrain/trainers/clm/train_clm_dpo.py                               |   118 --
 core/autotrain/trainers/clm/train_clm_orpo.py                              |    57 -
 core/autotrain/trainers/clm/train_clm_reward.py                            |   124 --
 core/autotrain/trainers/clm/train_clm_sft.py                               |    56 -
 core/autotrain/trainers/clm/utils.py                                       |   993 ----------
 core/autotrain/trainers/common.py                                          |   386 ----
 core/autotrain/trainers/extractive_question_answering/__init__.py          |     0
 core/autotrain/trainers/extractive_question_answering/__main__.py          |   263 ---
 core/autotrain/trainers/extractive_question_answering/dataset.py           |   121 --
 core/autotrain/trainers/extractive_question_answering/params.py            |    76 -
 core/autotrain/trainers/extractive_question_answering/utils.py             |   396 ----
 core/autotrain/trainers/generic/__init__.py                                |     0
 core/autotrain/trainers/generic/__main__.py                                |    58 -
 core/autotrain/trainers/generic/params.py                                  |    36 -
 core/autotrain/trainers/generic/utils.py                                   |   201 --
 core/autotrain/trainers/image_classification/__init__.py                   |     0
 core/autotrain/trainers/image_classification/__main__.py                   |   252 ---
 core/autotrain/trainers/image_classification/dataset.py                    |    46 -
 core/autotrain/trainers/image_classification/params.py                     |    70 -
 core/autotrain/trainers/image_classification/utils.py                      |   232 ---
 core/autotrain/trainers/image_regression/__init__.py                       |     0
 core/autotrain/trainers/image_regression/__main__.py                       |   226 ---
 core/autotrain/trainers/image_regression/dataset.py                        |    42 -
 core/autotrain/trainers/image_regression/params.py                         |    70 -
 core/autotrain/trainers/image_regression/utils.py                          |   174 --
 core/autotrain/trainers/object_detection/__init__.py                       |     0
 core/autotrain/trainers/object_detection/__main__.py                       |   236 ---
 core/autotrain/trainers/object_detection/dataset.py                        |    60 -
 core/autotrain/trainers/object_detection/params.py                         |    74 -
 core/autotrain/trainers/object_detection/utils.py                          |   270 ---
 core/autotrain/trainers/sent_transformers/__init__.py                      |     0
 core/autotrain/trainers/sent_transformers/__main__.py                      |   251 ---
 core/autotrain/trainers/sent_transformers/params.py                        |    84 -
 core/autotrain/trainers/sent_transformers/utils.py                         |   159 --
 core/autotrain/trainers/seq2seq/__init__.py                                |     0
 core/autotrain/trainers/seq2seq/__main__.py                                |   279 ---
 core/autotrain/trainers/seq2seq/dataset.py                                 |    41 -
 core/autotrain/trainers/seq2seq/params.py                                  |    88 -
 core/autotrain/trainers/seq2seq/utils.py                                   |    98 -
 core/autotrain/trainers/tabular/__init__.py                                |     0
 core/autotrain/trainers/tabular/__main__.py                                |   409 ----
 core/autotrain/trainers/tabular/params.py                                  |    52 -
 core/autotrain/trainers/tabular/utils.py                                   |   546 ------
 core/autotrain/trainers/text_classification/__init__.py                    |     0
 core/autotrain/trainers/text_classification/__main__.py                    |   239 ---
 core/autotrain/trainers/text_classification/dataset.py                     |    65 -
 core/autotrain/trainers/text_classification/params.py                      |    72 -
 core/autotrain/trainers/text_classification/utils.py                       |   179 --
 core/autotrain/trainers/text_regression/__init__.py                        |     0
 core/autotrain/trainers/text_regression/__main__.py                        |   229 ---
 core/autotrain/trainers/text_regression/dataset.py                         |    66 -
 core/autotrain/trainers/text_regression/params.py                          |    72 -
 core/autotrain/trainers/text_regression/utils.py                           |   118 --
 core/autotrain/trainers/token_classification/__init__.py                   |     0
 core/autotrain/trainers/token_classification/__main__.py                   |   235 ---
 core/autotrain/trainers/token_classification/dataset.py                    |    65 -
 core/autotrain/trainers/token_classification/params.py                     |    72 -
 core/autotrain/trainers/token_classification/utils.py                      |    98 -
 core/autotrain/trainers/vlm/__init__.py                                    |     0
 core/autotrain/trainers/vlm/__main__.py                                    |    37 -
 core/autotrain/trainers/vlm/dataset.py                                     |     0
 core/autotrain/trainers/vlm/params.py                                      |   101 -
 core/autotrain/trainers/vlm/train_vlm_generic.py                           |    98 -
 core/autotrain/trainers/vlm/utils.py                                       |   329 ----
 core/autotrain/utils.py                                                    |    82 -
 core/gradio_wrapper.py                                                     |   950 ----------
 core/launch_autotrain.py                                                   |    15 -
 core/requirements.txt                                                      |    50 -
 core/utils.py                                                              |    82 -
 e --continue                                                               |     2 -
 iNaturalist/iNaturalist-manifest.md                                        |   130 --
 iNaturalist/inaturalist_manager.py                                         |   911 ---------
 iNaturalist/unzip_ficus.py                                                 |    44 -
 index.js                                                                   |     8 -
 package-lock.json                                                          | 11429 ---------------------------------------------------------------------------------------------------------------
 package.json                                                               |    30 -
 utilities/crawl_schema.py                                                  |    29 -
 167 files changed, 15 insertions(+), 58378 deletions(-)

### Merge branch 'main' of https://github.com/Uwe1209/SPS
**Author:** darklorddad
**Date:** Mon Nov 17 07:17:05 2025 +0800



### fix: Reduce bottom spacing of IoT dashboard navigation bar
**Author:** darklorddad
**Date:** Mon Nov 17 06:58:09 2025 +0800



 SmartPlant/tabs/Tabs.js | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### fix: Adjust padding for IoT and Admin navigation bars
**Author:** darklorddad
**Date:** Mon Nov 17 06:56:51 2025 +0800



 SmartPlant/src/admin/components/AdminBottomNavBar.js | 6 ++----
 SmartPlant/tabs/Tabs.js                              | 4 ++--
 2 files changed, 4 insertions(+), 6 deletions(-)

### fix: Adjust navigation bar padding for user, expert, IoT, and admin dashboards
**Author:** darklorddad
**Date:** Mon Nov 17 06:46:50 2025 +0800



 SmartPlant/src/admin/components/AdminBottomNavBar.js | 4 ++--
 SmartPlant/src/components/Navigation.js              | 4 ++--
 SmartPlant/src/components/NavigationExpert.js        | 4 ++--
 SmartPlant/tabs/Tabs.js                              | 4 ++--
 4 files changed, 8 insertions(+), 8 deletions(-)

### fix: Update back button and reduce bottom navigation padding
**Author:** darklorddad
**Date:** Mon Nov 17 06:40:19 2025 +0800



 SmartPlant/src/admin/components/AdminBottomNavBar.js | 4 ++--
 SmartPlant/src/components/Navigation.js              | 4 ++--
 SmartPlant/src/components/NavigationExpert.js        | 4 ++--
 SmartPlant/tabs/Tabs.js                              | 5 +++--
 4 files changed, 9 insertions(+), 8 deletions(-)

### fix: Adjust bottom navigation bar padding and add IoT Dashboard back button
**Author:** darklorddad
**Date:** Mon Nov 17 06:38:34 2025 +0800



 SmartPlant/src/admin/components/AdminBottomNavBar.js |  4 ++--
 SmartPlant/src/components/Navigation.js              |  4 ++--
 SmartPlant/src/components/NavigationExpert.js        |  4 ++--
 SmartPlant/tabs/Tabs.js                              | 13 ++++++++++++-
 4 files changed, 18 insertions(+), 7 deletions(-)

### refactor: Remove plant rarity distribution and adjust admin nav bar padding
**Author:** darklorddad
**Date:** Mon Nov 17 06:35:30 2025 +0800



 SmartPlant/src/admin/components/AdminBottomNavBar.js |  4 ++--
 SmartPlant/src/admin/screens/DashboardScreen.js      | 55 -------------------------------------------------------
 2 files changed, 2 insertions(+), 57 deletions(-)

### fix: Correctly load local model and image processor from checkpoint
**Author:** darklorddad
**Date:** Sun Nov 16 18:36:04 2025 +0800



 core/gradio_wrapper.py | 40 +++++++++++++++++++++++-----------------
 1 file changed, 23 insertions(+), 17 deletions(-)

### fix: Reduce bottom navigation bar heights for improved safe area
**Author:** darklorddad
**Date:** Sun Nov 16 17:43:16 2025 +0800



 SmartPlant/src/admin/components/AdminBottomNavBar.js | 4 ++--
 SmartPlant/src/components/Navigation.js              | 4 ++--
 SmartPlant/src/components/NavigationExpert.js        | 4 ++--
 SmartPlant/tabs/Tabs.js                              | 2 +-
 4 files changed, 7 insertions(+), 7 deletions(-)

### Merge branch 'main' of https://github.com/Uwe1209/SPS
**Author:** darklorddad
**Date:** Sun Nov 16 17:38:40 2025 +0800



### fix: Reduce top padding constants for safe area
**Author:** darklorddad
**Date:** Sun Nov 16 17:35:37 2025 +0800



 SmartPlant/src/components/StatusBarManager.js | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### feat: add safe area insets to bottom navigation bars
**Author:** darklorddad
**Date:** Sun Nov 16 17:33:51 2025 +0800



 SmartPlant/src/admin/components/AdminBottomNavBar.js | 6 ++++--
 SmartPlant/src/components/Navigation.js              | 4 +++-
 SmartPlant/src/components/NavigationExpert.js        | 6 ++++--
 SmartPlant/tabs/Tabs.js                              | 8 +++++++-
 4 files changed, 18 insertions(+), 6 deletions(-)

### fix: Adjust map UI for Android by removing compass and zoom controls
**Author:** darklorddad
**Date:** Sun Nov 16 17:29:50 2025 +0800



 SmartPlant/src/screens/MapScreen.js | 5 +++--
 1 file changed, 3 insertions(+), 2 deletions(-)

### refactor: Relocate search and filter components on MapScreen
**Author:** darklorddad
**Date:** Sun Nov 16 17:23:20 2025 +0800



 SmartPlant/src/screens/MapScreen.js | 60 +++++++++++++++++++++++++++++++-----------------------------
 1 file changed, 31 insertions(+), 29 deletions(-)

### Merge branch 'main' of https://github.com/Uwe1209/SPS
**Author:** darklorddad
**Date:** Sun Nov 16 17:21:44 2025 +0800



### fix: Refactor map search and filters, remove duplicate location button
**Author:** darklorddad
**Date:** Sun Nov 16 17:20:28 2025 +0800



 SmartPlant/src/screens/MapScreen.js | 25 ++++++++++++++-----------
 1 file changed, 14 insertions(+), 11 deletions(-)

### fix: Adjust IoT Map search and filter positioning for Android status bar
**Author:** darklorddad
**Date:** Sun Nov 16 17:16:27 2025 +0800



 SmartPlant/src/screens/MapScreen.js | 5 +++--
 1 file changed, 3 insertions(+), 2 deletions(-)

### fix: Improve Android map marker and filter bar behaviour
**Author:** darklorddad
**Date:** Sun Nov 16 15:18:37 2025 +0800



 SmartPlant/src/screens/MapScreen.js | 68 +++++++++++++++++++++++++++++++++++---------------------------------
 1 file changed, 35 insertions(+), 33 deletions(-)

### fix: Resolve Android map marker and filter alignment issues
**Author:** darklorddad
**Date:** Sun Nov 16 15:10:04 2025 +0800



 SmartPlant/src/screens/MapScreen.js | 7 +++----
 1 file changed, 3 insertions(+), 4 deletions(-)

### fix: Use absolute path for AutoTrain database file
**Author:** darklorddad
**Date:** Sun Nov 16 14:47:03 2025 +0800



 core/autotrain/app/ui_routes.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### fix: Resolve navigation error and remove Firebase Analytics warnings
**Author:** darklorddad
**Date:** Sun Nov 16 14:44:23 2025 +0800



 SmartPlant/src/firebase/FirebaseConfig.js | 2 --
 SmartPlant/src/firebase/config.js         | 4 +---
 SmartPlant/src/pages/LoginSelection.js    | 2 +-
 SmartPlant/src/pages/UserLogin.js         | 2 +-
 4 files changed, 3 insertions(+), 7 deletions(-)

### Merge branch 'main' of https://github.com/Uwe1209/SPS
**Author:** darklorddad
**Date:** Sun Nov 16 14:43:40 2025 +0800



### fix: Correctly capture subprocess output in text mode
**Author:** darklorddad
**Date:** Sun Nov 16 14:43:37 2025 +0800



 core/gradio_wrapper.py | 5 +++--
 1 file changed, 3 insertions(+), 2 deletions(-)

### fix: Update Pydantic config to resolve TypeError in API model creation
**Author:** darklorddad
**Date:** Sun Nov 16 14:40:28 2025 +0800



 core/autotrain/app/api_routes.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### Merge branch 'main' of https://github.com/Uwe1209/SPS
**Author:** darklorddad
**Date:** Sun Nov 16 14:36:40 2025 +0800



### fix: Add onAuthStateChanged to firebase auth imports
**Author:** darklorddad
**Date:** Sun Nov 16 14:22:23 2025 +0800



 SmartPlant/src/admin/AdminContext.js | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### fix: Correctly load and update user favourites based on authentication state
**Author:** darklorddad
**Date:** Sun Nov 16 14:22:00 2025 +0800



 SmartPlant/src/admin/AdminContext.js | 19 ++++++++++++-------
 1 file changed, 12 insertions(+), 7 deletions(-)

### fix: Synchronise user favourite status with UI updates
**Author:** darklorddad
**Date:** Sun Nov 16 14:18:47 2025 +0800



 SmartPlant/src/admin/AdminContext.js | 11 +++++++++++
 1 file changed, 11 insertions(+)

### refactor: Remove admin user management from backend and add pull-to-refresh
**Author:** darklorddad
**Date:** Sun Nov 16 14:13:29 2025 +0800



 SmartPlant/src/admin/AdminContext.js                     | 22 ++--------------------
 SmartPlant/src/admin/screens/AccountManagementScreen.js  | 11 +++++++++--
 SmartPlant/src/admin/screens/AddUserScreen.js            | 15 ++++++++++++---
 SmartPlant/src/admin/screens/DashboardScreen.js          | 15 ++++++++++++---
 SmartPlant/src/admin/screens/EditUserScreen.js           | 15 ++++++++++++---
 SmartPlant/src/admin/screens/FeedbackDetailScreen.js     | 10 +++++++++-
 SmartPlant/src/admin/screens/FeedbackManagementScreen.js | 11 +++++++++--
 SmartPlant/src/admin/screens/MailDetailScreen.js         | 15 ++++++++++++---
 SmartPlant/src/admin/screens/MailManagementScreen.js     | 11 +++++++++--
 SmartPlant/src/admin/screens/UserProfileScreen.js        | 22 ++++++++++++++++------
 backend/index.js                                         |  2 --
 11 files changed, 102 insertions(+), 47 deletions(-)

### feat: Implement persistent favourites, complete user deletion, and feedback UI improvements
**Author:** darklorddad
**Date:** Sun Nov 16 14:04:12 2025 +0800



 SmartPlant/src/admin/AdminContext.js                     | 74 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++----------
 SmartPlant/src/admin/screens/FeedbackManagementScreen.js |  2 +-
 SmartPlant/src/admin/screens/UserProfileScreen.js        |  6 +++---
 backend/controllers/userController.js                    | 18 ++++++++++++++++++
 backend/index.js                                         |  2 ++
 backend/routes/user.js                                   |  7 +++++++
 6 files changed, 95 insertions(+), 14 deletions(-)

### fix: Implement median-based resampling for training set balancing
**Author:** darklorddad
**Date:** Sun Nov 16 13:39:58 2025 +0800



 core/gradio_wrapper.py | 136 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++----------------------------------------------------------------------
 1 file changed, 66 insertions(+), 70 deletions(-)

### fix: Refactor feedback filters and user management
**Author:** darklorddad
**Date:** Sun Nov 16 13:37:56 2025 +0800



 SmartPlant/src/admin/AdminContext.js                     | 16 +++++++++++++---
 SmartPlant/src/admin/screens/FeedbackDetailScreen.js     | 10 +++++-----
 SmartPlant/src/admin/screens/FeedbackManagementScreen.js | 28 +++++++++++++++-------------
 SmartPlant/src/firebase/FirebaseConfig.js                |  2 +-
 4 files changed, 34 insertions(+), 22 deletions(-)

### feat: implement median-based balanced resampling for training set
**Author:** darklorddad
**Date:** Sun Nov 16 13:37:32 2025 +0800



 core/app.py            | 2 +-
 core/gradio_wrapper.py | 2 +-
 2 files changed, 2 insertions(+), 2 deletions(-)

### style: Replace ampersands with 'and' for consistency in IoT dashboard text
**Author:** darklorddad
**Date:** Sun Nov 16 13:13:48 2025 +0800



 SmartPlant/src/admin/screens/DashboardScreen.js | 6 +++---
 1 file changed, 3 insertions(+), 3 deletions(-)

### fix: Correct IoT dashboard text for clarity and consistency
**Author:** darklorddad
**Date:** Sun Nov 16 13:10:16 2025 +0800



 SmartPlant/src/admin/screens/DashboardScreen.js | 6 +++---
 1 file changed, 3 insertions(+), 3 deletions(-)

### fix: Correct validation set generation after training set resampling
**Author:** darklorddad
**Date:** Sun Nov 16 13:09:28 2025 +0800



 core/gradio_wrapper.py | 20 +++++---------------
 1 file changed, 5 insertions(+), 15 deletions(-)

### feat: enhance admin dashboard with user management and feedback filters
**Author:** darklorddad
**Date:** Sun Nov 16 13:08:01 2025 +0800



 SmartPlant/src/admin/AdminContext.js                     | 61 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++-----
 SmartPlant/src/admin/screens/AccountManagementScreen.js  | 15 +++++++++++++--
 SmartPlant/src/admin/screens/DashboardScreen.js          | 52 ++--------------------------------------------------
 SmartPlant/src/admin/screens/FeedbackManagementScreen.js | 39 ++++++++++++++++++++++++++++++++++-----
 4 files changed, 105 insertions(+), 62 deletions(-)

### fix: Improve resampling logic by using a threshold to define majority classes
**Author:** darklorddad
**Date:** Sun Nov 16 10:59:18 2025 +0800



 core/gradio_wrapper.py | 49 +++++++++++++++++++++++++++----------------------
 1 file changed, 27 insertions(+), 22 deletions(-)

### fix: Implement memory-efficient resampling to prevent `MemoryError`
**Author:** darklorddad
**Date:** Sun Nov 16 10:16:05 2025 +0800



 core/gradio_wrapper.py | 173 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-------------------------------------------------------------------------------
 1 file changed, 94 insertions(+), 79 deletions(-)

### feat: Implement 100% oversampling and fix min class count calculation
**Author:** darklorddad
**Date:** Sun Nov 16 09:58:51 2025 +0800



 core/gradio_wrapper.py | 19 ++++++++++++++++---
 1 file changed, 16 insertions(+), 3 deletions(-)

### feat: Adjust undersampling strategy to achieve a 4:1 final ratio
**Author:** darklorddad
**Date:** Sun Nov 16 09:53:13 2025 +0800



 core/gradio_wrapper.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### fix: Correct resampling method label and image dimension
**Author:** darklorddad
**Date:** Sun Nov 16 09:46:19 2025 +0800



 core/app.py            | 2 +-
 core/gradio_wrapper.py | 6 +++---
 2 files changed, 4 insertions(+), 4 deletions(-)

### feat: Implement SMOTE and RandomUnderSampler pipeline with reduced image dimensions
**Author:** darklorddad
**Date:** Sun Nov 16 09:43:38 2025 +0800



 core/gradio_wrapper.py | 20 +++++++++++++++-----
 1 file changed, 15 insertions(+), 5 deletions(-)

### fix: Reduce memory usage during resampling by converting to float32
**Author:** darklorddad
**Date:** Sun Nov 16 08:56:30 2025 +0800



 core/gradio_wrapper.py | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)

### fix: Improve image loading robustness for resampling with special characters
**Author:** darklorddad
**Date:** Sun Nov 16 08:45:28 2025 +0800



 core/gradio_wrapper.py | 18 +++++++++++++-----
 1 file changed, 13 insertions(+), 5 deletions(-)

### feat: Add SMOTE and Tomek link resampling for training set
**Author:** darklorddad
**Date:** Sun Nov 16 08:18:50 2025 +0800



 core/app.py            |  3 ++-
 core/gradio_wrapper.py | 97 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++--------------------
 2 files changed, 79 insertions(+), 21 deletions(-)

### Merge branch 'main' of https://github.com/Uwe1209/SPS
**Author:** darklorddad
**Date:** Fri Nov 7 23:03:34 2025 +0800



### fix: Handle undefined user roles and expert navigation on profile screen
**Author:** darklorddad
**Date:** Fri Nov 7 22:00:20 2025 +0800



 SmartPlant/src/admin/screens/EditUserScreen.js    | 2 +-
 SmartPlant/src/admin/screens/UserProfileScreen.js | 2 +-
 SmartPlant/src/pages/Profile.js                   | 5 ++++-
 3 files changed, 6 insertions(+), 3 deletions(-)

### fix: Prevent crash when user name is undefined in admin screens
**Author:** darklorddad
**Date:** Fri Nov 7 21:55:19 2025 +0800



 SmartPlant/src/admin/screens/AccountManagementScreen.js | 4 ++--
 SmartPlant/src/admin/screens/UserProfileScreen.js       | 4 ++--
 2 files changed, 4 insertions(+), 4 deletions(-)

### fix: Correct admin profile navigation, add full stop to saved posts, and prevent crash
**Author:** darklorddad
**Date:** Fri Nov 7 21:49:09 2025 +0800



 SmartPlant/src/admin/screens/DashboardScreen.js | 12 +++++++++---
 SmartPlant/src/pages/Saved.js                   |  2 +-
 2 files changed, 10 insertions(+), 4 deletions(-)

### feat: implement default profile pictures and admin profile picture editing
**Author:** darklorddad
**Date:** Fri Nov 7 21:41:06 2025 +0800



 SmartPlant/src/admin/screens/EditUserScreen.js | 90 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-----
 SmartPlant/src/pages/EditProfile.js            | 29 +++++++++++++++++++++++++----
 SmartPlant/src/pages/Myprofile.js              | 31 ++++++++++++++++++++++++++-----
 SmartPlant/src/pages/Profile.js                | 32 +++++++++++++++++++++++++++-----
 SmartPlant/src/pages/Saved.js                  |  1 +
 5 files changed, 164 insertions(+), 19 deletions(-)

### refactor: Adjust styling on Saved Posts screen
**Author:** darklorddad
**Date:** Fri Nov 7 21:29:21 2025 +0800



 SmartPlant/src/pages/Saved.js | 9 ++-------
 1 file changed, 2 insertions(+), 7 deletions(-)

### fix: Adjust spacing, default profile picture, and expert login redirect
**Author:** darklorddad
**Date:** Fri Nov 7 21:28:51 2025 +0800



 SmartPlant/src/admin/screens/DashboardScreen.js      | 4 ++--
 SmartPlant/src/firebase/login_register/user_login.js | 6 +++---
 SmartPlant/src/pages/Profile.js                      | 2 +-
 SmartPlant/src/pages/Saved.js                        | 4 +---
 SmartPlant/src/pages/UserLogin.js                    | 8 ++++----
 5 files changed, 11 insertions(+), 13 deletions(-)

### feat: Redirect expert users to their dedicated homepage on login
**Author:** darklorddad
**Date:** Fri Nov 7 21:10:16 2025 +0800



 SmartPlant/src/pages/UserLogin.js | 47 ++++++++++++++++++++++++++++++++++++++++++-----
 1 file changed, 42 insertions(+), 5 deletions(-)

### feat: implement admin dashboard and refactor login flow
**Author:** darklorddad
**Date:** Fri Nov 7 20:36:11 2025 +0800



 .gitignore                                               |   11 +-
 App.js                                                   |   10 +-
 SmartPlant/App.js                                        |   11 +-
 SmartPlant/assets/facebook.png                           |  Bin 0 -> 890 bytes
 SmartPlant/assets/google.png                             |  Bin 0 -> 1247 bytes
 SmartPlant/package-lock.json                             | 3290 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++--------------------------------
 SmartPlant/package.json                                  |    3 +-
 SmartPlant/src/admin/AdminNavigator.js                   |   77 ++---
 SmartPlant/src/admin/Icons.js                            |    8 +
 SmartPlant/src/admin/components/AdminBottomNavBar.js     |   51 +++
 SmartPlant/src/admin/screens/AccountManagementScreen.js  |   84 +++--
 SmartPlant/src/admin/screens/DashboardScreen.js          |  203 +++++++----
 SmartPlant/src/admin/screens/FeedbackDetailScreen.js     |   10 +-
 SmartPlant/src/admin/screens/FeedbackManagementScreen.js |   53 ++-
 SmartPlant/src/components/StatusBarManager.js            |    4 +
 SmartPlant/src/config.js                                 |    2 +-
 SmartPlant/src/firebase/UserProfile/ProfileUpdate.js     |   46 ++-
 SmartPlant/src/firebase/UserProfile/UserUpdate.js        |   73 ++--
 SmartPlant/src/firebase/login_register/user_login.js     |   75 +++-
 SmartPlant/src/pages/AdminDashboard.js                   |   23 ++
 SmartPlant/src/pages/AdminLogin.js                       |  325 ------------------
 SmartPlant/src/pages/EditProfile.js                      |    6 +-
 SmartPlant/src/pages/Introduction.js                     |    6 +-
 SmartPlant/src/pages/LoginSelection.js                   |  370 --------------------
 SmartPlant/src/pages/UserLogin.js                        |  602 ++++++++++-----------------------
 SmartPlant/src/pages/UserRegister.js                     |  404 ++++------------------
 26 files changed, 3451 insertions(+), 2296 deletions(-)

### feat: Sort mail management screen by latest to oldest
**Author:** darklorddad
**Date:** Fri Nov 7 20:31:05 2025 +0800



 SmartPlant/src/admin/AdminContext.js                 |  5 +++--
 SmartPlant/src/admin/screens/MailManagementScreen.js | 10 +++++++---
 2 files changed, 10 insertions(+), 5 deletions(-)

### feat: implement collapsible mail groups and fix user profile back button
**Author:** darklorddad
**Date:** Fri Nov 7 20:27:06 2025 +0800



 SmartPlant/src/admin/screens/MailManagementScreen.js | 24 +++++++++++++++++++++---
 SmartPlant/src/admin/screens/UserProfileScreen.js    |  8 ++++++--
 2 files changed, 27 insertions(+), 5 deletions(-)

### feat: display sender profile pictures in mail management screens
**Author:** darklorddad
**Date:** Fri Nov 7 20:23:40 2025 +0800



 SmartPlant/src/admin/screens/MailDetailScreen.js     | 16 ++++++++++++++--
 SmartPlant/src/admin/screens/MailManagementScreen.js | 55 ++++++++++++++++++++++++++++++++++++-------------------
 2 files changed, 50 insertions(+), 21 deletions(-)

### fix: Add 'read' filter and display correct mail details
**Author:** darklorddad
**Date:** Fri Nov 7 20:18:26 2025 +0800



 SmartPlant/src/admin/screens/MailDetailScreen.js     | 46 +++++++++++++++++++++++++++++++++++++++++-----
 SmartPlant/src/admin/screens/MailManagementScreen.js |  4 ++++
 2 files changed, 45 insertions(+), 5 deletions(-)

### fix: Correct back button navigation on user profile screen
**Author:** darklorddad
**Date:** Fri Nov 7 20:15:24 2025 +0800



 SmartPlant/src/admin/screens/UserProfileScreen.js | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### fix: Resolve text rendering, improve mail management, and adjust spacing
**Author:** darklorddad
**Date:** Fri Nov 7 20:14:00 2025 +0800



 SmartPlant/src/admin/AdminContext.js                 | 42 ++++++++++++++++++++++++++++++++++++++++--
 SmartPlant/src/admin/screens/AddUserScreen.js        |  4 ++--
 SmartPlant/src/admin/screens/EditUserScreen.js       |  2 +-
 SmartPlant/src/admin/screens/MailDetailScreen.js     | 10 ++++++++--
 SmartPlant/src/admin/screens/MailManagementScreen.js | 13 +++++++++----
 5 files changed, 60 insertions(+), 11 deletions(-)

### feat: integrate Firebase for mail management and add reply functionality
**Author:** darklorddad
**Date:** Fri Nov 7 20:13:57 2025 +0800



 SmartPlant/src/admin/AdminContext.js                 | 203 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++---------------------------------------------------------
 SmartPlant/src/admin/screens/MailDetailScreen.js     |  30 ++++++++++++++++++++-------
 SmartPlant/src/admin/screens/MailManagementScreen.js |  56 ++++++++++++++++++++++++--------------------------
 3 files changed, 189 insertions(+), 100 deletions(-)

### fix: Centre the user profile title on the admin dashboard
**Author:** darklorddad
**Date:** Fri Nov 7 20:09:20 2025 +0800



 SmartPlant/src/admin/screens/UserProfileScreen.js | 7 +++++--
 1 file changed, 5 insertions(+), 2 deletions(-)

### feat: enhance user profile screen with more details and activity counts
**Author:** darklorddad
**Date:** Fri Nov 7 20:09:18 2025 +0800



 SmartPlant/src/admin/screens/UserProfileScreen.js | 96 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++---------------------
 1 file changed, 75 insertions(+), 21 deletions(-)

### feat: add user editing functionality and enhance user creation form
**Author:** darklorddad
**Date:** Fri Nov 7 19:58:03 2025 +0800



 SmartPlant/src/admin/screens/AddUserScreen.js  | 131 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++------
 SmartPlant/src/admin/screens/EditUserScreen.js | 279 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 402 insertions(+), 8 deletions(-)

### refactor: Centralise API URL configuration in a single file
**Author:** darklorddad
**Date:** Fri Nov 7 19:29:05 2025 +0800



 SmartPlant/src/config.js                | 1 +
 SmartPlant/src/pages/identify.js        | 5 +++--
 SmartPlant/src/pages/identify_output.js | 3 ++-
 3 files changed, 6 insertions(+), 3 deletions(-)

### fix: Configure backend to listen on all network interfaces
**Author:** darklorddad
**Date:** Fri Nov 7 18:43:23 2025 +0800



 backend/index.js | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### style: Remove trailing whitespace in backend/index.js
**Author:** darklorddad
**Date:** Fri Nov 7 18:41:27 2025 +0800



 backend/index.js | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### fix: Update backend host IP address to match frontend configuration
**Author:** darklorddad
**Date:** Fri Nov 7 18:36:50 2025 +0800



 backend/index.js | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### fix: Bind server to specific IP address
**Author:** darklorddad
**Date:** Fri Nov 7 18:36:48 2025 +0800



 backend/index.js | 6 ++++--
 1 file changed, 4 insertions(+), 2 deletions(-)

### fix: Display default avatars for commenters without profile pictures
**Author:** darklorddad
**Date:** Fri Nov 7 18:25:54 2025 +0800



 SmartPlant/src/pages/PlantDetailUser.js | 68 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++------------
 1 file changed, 56 insertions(+), 12 deletions(-)

### fix: Adjust status bar spacing, user avatars, and AI result images
**Author:** darklorddad
**Date:** Fri Nov 7 18:21:19 2025 +0800



 SmartPlant/src/pages/PostDetail.js      | 2 +-
 SmartPlant/src/pages/ReportError.js     | 7 ++++---
 SmartPlant/src/pages/TopSuggestions.js  | 7 ++++---
 SmartPlant/src/pages/identify_output.js | 4 +++-
 4 files changed, 12 insertions(+), 8 deletions(-)

### fix: Correctly display plant details and images on PlantDetailUser screen
**Author:** darklorddad
**Date:** Fri Nov 7 18:13:18 2025 +0800



 SmartPlant/src/pages/PlantDetailUser.js | 24 +++++++++++++++++++-----
 1 file changed, 19 insertions(+), 5 deletions(-)

### feat: Display user initials and post verification status
**Author:** darklorddad
**Date:** Fri Nov 7 18:02:44 2025 +0800



 SmartPlant/src/pages/HomepageUser.js | 26 ++++++++++++++++++++++----
 SmartPlant/src/pages/MyPost.js       | 33 ++++++++++++++++++++++++++++-----
 SmartPlant/src/pages/PostDetail.js   | 23 +++++++++++++++++++----
 3 files changed, 69 insertions(+), 13 deletions(-)

### fix: Import ImageSlideshow and initialise currentSlide state
**Author:** darklorddad
**Date:** Fri Nov 7 17:57:15 2025 +0800



 SmartPlant/src/pages/HomepageUser.js | 2 ++
 1 file changed, 2 insertions(+)

### fix: Resolve post display, image loading, and navigation issues
**Author:** darklorddad
**Date:** Fri Nov 7 17:54:43 2025 +0800



 SmartPlant/src/components/ImageSlideShow.js |  6 +++---
 SmartPlant/src/pages/HomepageUser.js        | 11 ++++++++---
 2 files changed, 11 insertions(+), 6 deletions(-)

### feat: Implement search functionality for map markers
**Author:** darklorddad
**Date:** Fri Nov 7 17:47:18 2025 +0800



 SmartPlant/src/pages/MapPage.js | 18 +++++++++++++++---
 1 file changed, 15 insertions(+), 3 deletions(-)

### fix: Implement modal for three-dot menu with tap-outside-to-close functionality
**Author:** darklorddad
**Date:** Fri Nov 7 17:44:33 2025 +0800



 SmartPlant/src/pages/MapPage.js | 87 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++------------------------
 1 file changed, 63 insertions(+), 24 deletions(-)

### fix: Remove backdrop to prevent accidental menu closure
**Author:** darklorddad
**Date:** Fri Nov 7 17:40:53 2025 +0800



 SmartPlant/src/pages/MapPage.js | 18 +++---------------
 1 file changed, 3 insertions(+), 15 deletions(-)

### fix: Enable menu item taps by wrapping menu in Pressable component
**Author:** darklorddad
**Date:** Fri Nov 7 17:37:32 2025 +0800



 SmartPlant/src/pages/MapPage.js | 6 +++---
 1 file changed, 3 insertions(+), 3 deletions(-)

### fix: Enable menu item taps by adjusting touch responder
**Author:** darklorddad
**Date:** Fri Nov 7 17:34:37 2025 +0800



 SmartPlant/src/pages/MapPage.js | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### fix: Prevent menu taps from closing bottom sheet
**Author:** darklorddad
**Date:** Fri Nov 7 17:15:12 2025 +0800



 SmartPlant/src/pages/MapPage.js | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### feat: adjust bottom sheet height and update menu action placeholder
**Author:** darklorddad
**Date:** Fri Nov 7 17:13:54 2025 +0800



 SmartPlant/src/pages/MapPage.js | 10 +++++-----
 1 file changed, 5 insertions(+), 5 deletions(-)

### fix: Add backdrop to close plant menu on tap outside
**Author:** darklorddad
**Date:** Fri Nov 7 17:12:03 2025 +0800



 SmartPlant/src/pages/MapPage.js | 17 ++++++++++++++++-
 1 file changed, 16 insertions(+), 1 deletion(-)

### fix: Adjust bottom sheet height to 50% on marker press
**Author:** darklorddad
**Date:** Fri Nov 7 17:07:25 2025 +0800



 SmartPlant/src/pages/MapPage.js | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### fix: Centre bottom sheet title in header with back button
**Author:** darklorddad
**Date:** Fri Nov 7 17:05:30 2025 +0800



 SmartPlant/src/pages/MapPage.js | 6 +++---
 1 file changed, 3 insertions(+), 3 deletions(-)

### fix: Adjust bottom sheet height and reposition marker title
**Author:** darklorddad
**Date:** Fri Nov 7 17:00:42 2025 +0800



 SmartPlant/src/pages/MapPage.js | 10 +++++-----
 1 file changed, 5 insertions(+), 5 deletions(-)

### fix: Correct Firebase config import path in MapPage.js
**Author:** darklorddad
**Date:** Fri Nov 7 16:54:17 2025 +0800



 SmartPlant/src/pages/MapPage.js | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### feat: improve map page UI and filter logic
**Author:** darklorddad
**Date:** Fri Nov 7 16:48:53 2025 +0800



 SmartPlant/src/pages/MapPage.js | 91 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++------------------
 1 file changed, 73 insertions(+), 18 deletions(-)

### fix: Prevent bottom sheet from teleporting on touch
**Author:** darklorddad
**Date:** Fri Nov 7 16:15:22 2025 +0800



 SmartPlant/src/pages/MapPage.js | 3 +++
 1 file changed, 3 insertions(+)

### fix: Improve bottom sheet gesture release logic to prevent "teleporting"
**Author:** darklorddad
**Date:** Fri Nov 7 16:12:48 2025 +0800



 SmartPlant/src/pages/MapPage.js | 47 ++++++++++++++++++++++++++---------------------
 1 file changed, 26 insertions(+), 21 deletions(-)

### fix: Prevent expander flickering by stabilising gesture handler
**Author:** darklorddad
**Date:** Fri Nov 7 16:10:11 2025 +0800



 SmartPlant/src/pages/MapPage.js | 17 ++++++++++-------
 1 file changed, 10 insertions(+), 7 deletions(-)

### fix: Prevent bottom sheet from resting in half-way state
**Author:** darklorddad
**Date:** Fri Nov 7 16:02:29 2025 +0800



 SmartPlant/src/pages/MapPage.js | 6 ++----
 1 file changed, 2 insertions(+), 4 deletions(-)

### fix: Adjust map bottom sheet initial and expanded heights
**Author:** darklorddad
**Date:** Fri Nov 7 15:57:23 2025 +0800



 SmartPlant/src/pages/MapPage.js | 12 ++++++------
 1 file changed, 6 insertions(+), 6 deletions(-)

### fix: Ensure map markers update correctly by removing `tracksViewChanges`
**Author:** darklorddad
**Date:** Fri Nov 7 15:52:03 2025 +0800



 SmartPlant/src/pages/MapPage.js | 1 -
 1 file changed, 1 deletion(-)

### feat: Implement custom image markers for map plants
**Author:** darklorddad
**Date:** Fri Nov 7 15:50:43 2025 +0800



 SmartPlant/src/pages/MapPage.js | 41 +++++++++++++++++++++++++++--------------
 1 file changed, 27 insertions(+), 14 deletions(-)

### refactor: Replace custom image markers with standard coloured pins
**Author:** darklorddad
**Date:** Fri Nov 7 15:47:40 2025 +0800



 SmartPlant/src/pages/MapPage.js | 32 ++++++++++++++------------------
 1 file changed, 14 insertions(+), 18 deletions(-)

### fix: Ensure map markers are visible with a background container
**Author:** darklorddad
**Date:** Fri Nov 7 15:42:53 2025 +0800



 SmartPlant/src/pages/MapPage.js | 16 ++++++++++++++--
 1 file changed, 14 insertions(+), 2 deletions(-)

### fix: Correct `selectedTab` reference to `selectedFilters` in MapPage.js
**Author:** darklorddad
**Date:** Fri Nov 7 15:40:09 2025 +0800



 SmartPlant/src/pages/MapPage.js | 6 +++---
 1 file changed, 3 insertions(+), 3 deletions(-)

### refactor: update map filtering logic to use multiple selected filters
**Author:** darklorddad
**Date:** Fri Nov 7 15:37:22 2025 +0800



 SmartPlant/src/pages/MapPage.js | 34 +++++++++++++++++++++++-----------
 1 file changed, 23 insertions(+), 11 deletions(-)

### feat: implement multi-select filters and add verified/unverified options
**Author:** darklorddad
**Date:** Fri Nov 7 15:37:04 2025 +0800



 SmartPlant/src/pages/MapPage.js | 37 +++++++++++++++++++++++++++----------
 1 file changed, 27 insertions(+), 10 deletions(-)

### fix: Display all plant markers on map, including unverified ones
**Author:** darklorddad
**Date:** Fri Nov 7 15:32:55 2025 +0800



 SmartPlant/src/pages/MapPage.js | 9 ++-------
 1 file changed, 2 insertions(+), 7 deletions(-)

### fix: Display only verified plant markers on the map
**Author:** darklorddad
**Date:** Fri Nov 7 15:27:57 2025 +0800



 SmartPlant/src/pages/MapPage.js | 9 +++++++--
 1 file changed, 7 insertions(+), 2 deletions(-)

### feat: enhance map page with multiple collections and UI improvements
**Author:** darklorddad
**Date:** Fri Nov 7 15:27:54 2025 +0800



 SmartPlant/src/pages/MapPage.js | 242 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-------------------------------------------------------------------------------
 1 file changed, 148 insertions(+), 94 deletions(-)

### fix: Pass postId to PostDetail and remove redundant data fetching
**Author:** darklorddad
**Date:** Fri Nov 7 15:22:10 2025 +0800



 SmartPlant/src/pages/NotificationUser.js | 18 ++++--------------
 1 file changed, 4 insertions(+), 14 deletions(-)

### fix: Correctly display images on MyPost screen and remove debug logs
**Author:** darklorddad
**Date:** Fri Nov 7 15:20:12 2025 +0800



 SmartPlant/src/pages/MyPost.js | 11 +++--------
 1 file changed, 3 insertions(+), 8 deletions(-)

### refactor: Update MyPost to fetch user data from 'account' and enhance post details
**Author:** darklorddad
**Date:** Fri Nov 7 15:20:09 2025 +0800



 SmartPlant/src/pages/MyPost.js | 48 +++++++++++++++++++++++++++++++++++++++++++-----
 1 file changed, 43 insertions(+), 5 deletions(-)

### fix: Adjust PostDetail header layout to reduce gap between avatar and name
**Author:** darklorddad
**Date:** Fri Nov 7 15:17:39 2025 +0800



 SmartPlant/src/pages/PostDetail.js | 22 ++++++++++++----------
 1 file changed, 12 insertions(+), 10 deletions(-)

### fix: Correct image loading and display in saved posts and post details
**Author:** darklorddad
**Date:** Fri Nov 7 15:13:02 2025 +0800



 SmartPlant/src/pages/PostDetail.js | 11 ++++++++---
 SmartPlant/src/pages/Saved.js      | 11 ++++-------
 2 files changed, 12 insertions(+), 10 deletions(-)

### feat: refactor saved posts to use real-time updates and simplify image handling
**Author:** darklorddad
**Date:** Fri Nov 7 15:12:58 2025 +0800



 SmartPlant/src/pages/Saved.js | 149 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++------------------------------------------------------------------------------------
 1 file changed, 65 insertions(+), 84 deletions(-)

### fix: Correct navigation after logout and remove temporary admin link
**Author:** darklorddad
**Date:** Fri Nov 7 15:09:29 2025 +0800



 SmartPlant/src/pages/Profile.js | 12 +-----------
 1 file changed, 1 insertion(+), 11 deletions(-)

### fix: Correct JSX closing tag in PostDetail.js
**Author:** darklorddad
**Date:** Fri Nov 7 15:05:38 2025 +0800



 SmartPlant/src/pages/PostDetail.js | 1 -
 1 file changed, 1 deletion(-)

### feat: refactor PostDetail to fetch post data dynamically and display comments
**Author:** darklorddad
**Date:** Fri Nov 7 15:05:36 2025 +0800



 SmartPlant/src/pages/PostDetail.js | 261 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++------------------------------------------------------------------------------------------------
 1 file changed, 135 insertions(+), 126 deletions(-)

### fix: Remove duplicate TOP_PAD declaration in HomepageUser.js
**Author:** darklorddad
**Date:** Fri Nov 7 15:01:15 2025 +0800



 SmartPlant/src/pages/HomepageUser.js | 1 -
 1 file changed, 1 deletion(-)

### feat: display user profile picture and name on homepage
**Author:** darklorddad
**Date:** Fri Nov 7 15:01:12 2025 +0800



 SmartPlant/src/pages/HomepageUser.js | 134 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-------------------------------------------------
 1 file changed, 85 insertions(+), 49 deletions(-)

### Merge branch 'main' of https://github.com/Uwe1209/SPS
**Author:** darklorddad
**Date:** Fri Nov 7 13:55:05 2025 +0800



### fix: Correct Windows path string to prevent unicode escape error
**Author:** darklorddad
**Date:** Thu Nov 6 11:29:17 2025 +0800



 utilities/crawl_schema.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### fix: Update Firebase service account key path
**Author:** darklorddad
**Date:** Thu Nov 6 11:29:14 2025 +0800



 utilities/crawl_schema.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### feat: add Python script to crawl Firestore schema
**Author:** darklorddad
**Date:** Thu Nov 6 11:20:13 2025 +0800



 utilities/crawl_schema.py | 29 +++++++++++++++++++++++++++++
 1 file changed, 29 insertions(+)

### fix: Set initial route to Introduction page
**Author:** darklorddad
**Date:** Thu Nov 6 10:32:02 2025 +0800



 SmartPlant/App.js | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### fix: Update package dependencies to recommended Expo versions
**Author:** darklorddad
**Date:** Thu Nov 6 10:11:41 2025 +0800



 SmartPlant/package.json | 12 ++++++------
 1 file changed, 6 insertions(+), 6 deletions(-)

### fix: Add missing `@react-native/metro-config` dev dependency
**Author:** darklorddad
**Date:** Thu Nov 6 10:08:25 2025 +0800



 SmartPlant/package.json | 1 +
 1 file changed, 1 insertion(+)

### fix: Add missing `@react-native-community/cli` and `start` script
**Author:** darklorddad
**Date:** Thu Nov 6 10:06:24 2025 +0800



 SmartPlant/package.json | 1 +
 backend/package.json    | 1 +
 2 files changed, 2 insertions(+)

### refactor: Update gitignore and remove unused files
**Author:** darklorddad
**Date:** Thu Nov 6 09:54:21 2025 +0800



 .gitignore                                                                 |    20 +-
 core/Dataset-iNaturalist/Dataset-iNaturalist-train.md                      | 16091 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 core/Dataset-iNaturalist/Dataset-iNaturalist-validate.md                   |  5176 +++++++++++++++++++++++++++++++++++++++++++++++++++
 core/Dataset-iNaturalist/Preprocessed/Dataset-iNaturalist-preprocessed.txt |  1197 ++++++++++++
 core/LICENSE                                                               |   661 -------
 core/manifest.md                                                           |   154 --
 core/utilities/autotrain_dataset_splitter.py                               |   236 ---
 core/utilities/check_balance.py                                            |   141 --
 core/utilities/count_classes.py                                            |   168 --
 core/utilities/directory_manifest.py                                       |   100 -
 core/utilities/normalise_class_names.py                                    |   129 --
 core/utilities/normalise_image_names.py                                    |   205 --
 core/utilities/organise_dataset.py                                         |   151 --
 core/utilities/plot_metrics.py                                             |   281 ---
 iNaturalist/inaturalist_manager.py                                         |     2 +-
 15 files changed, 22470 insertions(+), 2242 deletions(-)

### Merge branch 'main' of https://github.com/Uwe1209/SPS
**Author:** darklorddad
**Date:** Mon Nov 3 00:30:17 2025 +0800



### fix: Prevent model selection from being cleared on refresh
**Author:** darklorddad
**Date:** Tue Oct 28 17:42:02 2025 +0800



 core/app.py            |  6 +++---
 core/gradio_wrapper.py | 10 ++++++++--
 2 files changed, 11 insertions(+), 5 deletions(-)

### style: Capitalise training metric chart titles
**Author:** darklorddad
**Date:** Tue Oct 28 17:31:58 2025 +0800



 core/utils.py | 22 +++++++++++-----------
 1 file changed, 11 insertions(+), 11 deletions(-)

### fix: Adjust UI for AutoTrain launch and status display
**Author:** darklorddad
**Date:** Tue Oct 28 01:42:12 2025 +0800



 core/app.py            | 2 +-
 core/gradio_wrapper.py | 8 ++++----
 2 files changed, 5 insertions(+), 5 deletions(-)

### feat: improve model selection dropdowns and display names
**Author:** darklorddad
**Date:** Tue Oct 28 01:21:59 2025 +0800



 core/app.py            | 4 ++--
 core/gradio_wrapper.py | 2 +-
 2 files changed, 3 insertions(+), 3 deletions(-)

### feat: Enhance model discovery to find latest checkpoints and update chart loading
**Author:** darklorddad
**Date:** Tue Oct 28 01:06:05 2025 +0800



 core/gradio_wrapper.py | 68 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++--------
 1 file changed, 60 insertions(+), 8 deletions(-)

### fix: Correctly display training metrics and sync model selection
**Author:** darklorddad
**Date:** Mon Oct 27 22:41:30 2025 +0800



 core/app.py | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### fix: Correct model selection in training metrics tab
**Author:** darklorddad
**Date:** Mon Oct 27 22:08:29 2025 +0800



 core/app.py | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### fix: Scan for models in the application's directory
**Author:** darklorddad
**Date:** Mon Oct 27 21:48:52 2025 +0800



 core/gradio_wrapper.py | 7 ++++---
 1 file changed, 4 insertions(+), 3 deletions(-)

### feat: add log message for AutoTrain output thread start
**Author:** darklorddad
**Date:** Mon Oct 27 17:12:55 2025 +0800



 core/gradio_wrapper.py | 1 +
 1 file changed, 1 insertion(+)

### fix: Handle UnicodeDecodeError in subprocess output on Windows
**Author:** darklorddad
**Date:** Mon Oct 27 17:11:01 2025 +0800



 core/gradio_wrapper.py | 6 ++----
 1 file changed, 2 insertions(+), 4 deletions(-)

### feat: stream AutoTrain UI output to console and Gradio status box
**Author:** darklorddad
**Date:** Mon Oct 27 16:52:45 2025 +0800



 core/gradio_wrapper.py | 130 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++------------------------------------------------------
 1 file changed, 76 insertions(+), 54 deletions(-)

### fix: Ensure AutoTrain subprocess inherits correct Python path
**Author:** darklorddad
**Date:** Mon Oct 27 16:48:26 2025 +0800



 core/gradio_wrapper.py   | 11 ++++++++---
 core/launch_autotrain.py | 20 ++++----------------
 2 files changed, 12 insertions(+), 19 deletions(-)

### fix: Improve AutoTrain UI launch and termination reliability
**Author:** darklorddad
**Date:** Mon Oct 27 16:36:28 2025 +0800



 core/gradio_wrapper.py   | 19 ++++++++-----------
 core/launch_autotrain.py | 25 ++++++++++++++++++++-----
 2 files changed, 28 insertions(+), 16 deletions(-)

### fix: Ensure AutoTrain UI process and its children are terminated correctly
**Author:** darklorddad
**Date:** Mon Oct 27 16:31:38 2025 +0800



 core/gradio_wrapper.py | 78 +++++++++++++++++++++++++++++++++++++++++++++++++++---------------------------
 1 file changed, 51 insertions(+), 27 deletions(-)

### fix: Correct AutoTrain module path for subprocess launch
**Author:** darklorddad
**Date:** Mon Oct 27 15:57:35 2025 +0800



 core/gradio_wrapper.py | 8 ++++++--
 1 file changed, 6 insertions(+), 2 deletions(-)

### fix: Add AutoTrain path to PYTHONPATH for subprocess
**Author:** darklorddad
**Date:** Mon Oct 27 15:52:21 2025 +0800



 core/gradio_wrapper.py | 7 ++++++-
 1 file changed, 6 insertions(+), 1 deletion(-)

### fix: Launch AutoTrain UI as a module to resolve path issues
**Author:** darklorddad
**Date:** Mon Oct 27 15:47:57 2025 +0800



 core/gradio_wrapper.py | 3 +--
 1 file changed, 1 insertion(+), 2 deletions(-)

### fix: Set correct working directory for AutoTrain UI subprocess
**Author:** darklorddad
**Date:** Mon Oct 27 15:15:32 2025 +0800



 core/gradio_wrapper.py | 6 ++++--
 1 file changed, 4 insertions(+), 2 deletions(-)

### fix: Correct path to `launch_autotrain.py`
**Author:** darklorddad
**Date:** Mon Oct 27 15:01:24 2025 +0800



 core/gradio_wrapper.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### fix: Improve AutoTrain UI startup error reporting
**Author:** darklorddad
**Date:** Mon Oct 27 14:59:47 2025 +0800



 core/gradio_wrapper.py | 27 ++++++++++++++++++++++-----
 1 file changed, 22 insertions(+), 5 deletions(-)

### fix: Make AutoTrain path a required input and add validation
**Author:** darklorddad
**Date:** Mon Oct 27 14:57:09 2025 +0800



 core/app.py            | 2 +-
 core/gradio_wrapper.py | 7 ++++---
 2 files changed, 5 insertions(+), 4 deletions(-)

### feat: Allow specifying AutoTrain folder path in training tab
**Author:** darklorddad
**Date:** Mon Oct 27 14:49:14 2025 +0800



 core/app.py              | 3 ++-
 core/gradio_wrapper.py   | 4 +++-
 core/launch_autotrain.py | 9 ++++++++-
 3 files changed, 13 insertions(+), 3 deletions(-)

### feat: enhance split dataset manifest with detailed class statistics
**Author:** darklorddad
**Date:** Mon Oct 27 14:07:17 2025 +0800



 core/gradio_wrapper.py | 105 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++----------------------
 1 file changed, 83 insertions(+), 22 deletions(-)

### fix: Enhance dataset splittability report with outcome and reasons
**Author:** darklorddad
**Date:** Mon Oct 27 13:38:52 2025 +0800



 core/gradio_wrapper.py | 33 ++++++++++++++++++++++++++-------
 1 file changed, 26 insertions(+), 7 deletions(-)

### fix: Correct all-or-nothing logic and enhance splittability report
**Author:** darklorddad
**Date:** Sun Oct 26 21:51:36 2025 +0800



 core/gradio_wrapper.py | 45 ++++++++++++++++++++++++++-------------------
 1 file changed, 26 insertions(+), 19 deletions(-)

### refactor: Enforce strict 'all-or-nothing' class splitting logic
**Author:** darklorddad
**Date:** Sun Oct 26 20:40:24 2025 +0800



 core/gradio_wrapper.py | 66 ++++++++++++++++++++++++++++++++----------------------------------
 1 file changed, 32 insertions(+), 34 deletions(-)

### refactor: Implement all-or-nothing class splitting for dataset consistency
**Author:** darklorddad
**Date:** Sun Oct 26 20:28:21 2025 +0800



 core/gradio_wrapper.py | 59 ++++++++++++++++++++++++++++++-----------------------------
 1 file changed, 30 insertions(+), 29 deletions(-)

### feat: enhance dataset splittability check with detailed report
**Author:** darklorddad
**Date:** Sun Oct 26 19:48:11 2025 +0800



 core/app.py            |   2 +-
 core/gradio_wrapper.py | 149 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++--------------------------------------------------------
 2 files changed, 94 insertions(+), 57 deletions(-)

### fix: Sort dataset balance chart alphabetically by class name
**Author:** darklorddad
**Date:** Sun Oct 26 19:41:36 2025 +0800



 core/gradio_wrapper.py | 11 +++++------
 1 file changed, 5 insertions(+), 6 deletions(-)

### feat: Add imbalance ratio to dataset balance report
**Author:** darklorddad
**Date:** Sun Oct 26 19:39:57 2025 +0800



 core/gradio_wrapper.py | 3 +++
 1 file changed, 3 insertions(+)

### feat: add dataset splittability check and balance report enhancements
**Author:** darklorddad
**Date:** Sun Oct 26 19:38:29 2025 +0800



 core/app.py            |  48 +++++++++++++++++++++++++++++++++++++++++++++++-
 core/gradio_wrapper.py | 107 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 154 insertions(+), 1 deletion(-)

### feat: enhance dataset balance report with total counts
**Author:** darklorddad
**Date:** Sun Oct 26 19:27:21 2025 +0800



 core/gradio_wrapper.py | 5 ++++-
 1 file changed, 4 insertions(+), 1 deletion(-)

### docs: add core manifest file
**Author:** darklorddad
**Date:** Sun Oct 26 19:13:48 2025 +0800



 core/manifest.md | 154 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 154 insertions(+)

### fix: Handle directory path for manifest output by appending default filename
**Author:** darklorddad
**Date:** Sun Oct 26 19:07:51 2025 +0800



 core/gradio_wrapper.py | 2 ++
 1 file changed, 2 insertions(+)

### refactor: Move dataset balance check to utilities and sort output
**Author:** darklorddad
**Date:** Sun Oct 26 18:54:57 2025 +0800



 core/app.py            | 46 +++++++++++++++++++++++-----------------------
 core/gradio_wrapper.py | 12 ++++++------
 2 files changed, 29 insertions(+), 29 deletions(-)

### fix: Update dataset balance and split type UI text
**Author:** darklorddad
**Date:** Sun Oct 26 18:49:37 2025 +0800



 core/app.py | 6 +++---
 1 file changed, 3 insertions(+), 3 deletions(-)

### feat: enhance dataset balance check with save toggle and detailed stats
**Author:** darklorddad
**Date:** Sun Oct 26 07:31:36 2025 +0800



 core/app.py            | 16 ++++++++++++----
 core/gradio_wrapper.py | 73 ++++++++++++++++++++++++++++++++++++++++++-------------------------------
 2 files changed, 54 insertions(+), 35 deletions(-)

### feat: add dataset balance check and move manifest generation to utilities
**Author:** darklorddad
**Date:** Sun Oct 26 06:40:50 2025 +0800



 core/app.py            | 48 ++++++++++++++++++++++++++++++++----------------
 core/gradio_wrapper.py | 67 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 99 insertions(+), 16 deletions(-)

### feat: enhance manifest with included and skipped class summaries
**Author:** darklorddad
**Date:** Sun Oct 26 06:21:55 2025 +0800



 core/gradio_wrapper.py | 43 ++++++++++++++++++++++++++++++++++++-------
 1 file changed, 36 insertions(+), 7 deletions(-)

### feat: allow custom manifest output paths for dataset splitting
**Author:** darklorddad
**Date:** Sun Oct 26 06:03:10 2025 +0800



 core/app.py            | 19 +++++++++++--------
 core/gradio_wrapper.py | 17 +++++++++++------
 2 files changed, 22 insertions(+), 14 deletions(-)

### fix: Update dataset preparation UI and manifest handling
**Author:** darklorddad
**Date:** Sun Oct 26 05:59:24 2025 +0800



 core/app.py            |  8 ++++----
 core/gradio_wrapper.py | 25 +++++++++----------------
 2 files changed, 13 insertions(+), 20 deletions(-)

### refactor: Improve dataset preparation UI and split dataset functionality
**Author:** darklorddad
**Date:** Sun Oct 26 05:49:22 2025 +0800



 core/app.py            | 30 +++++++++++++-----------------
 core/gradio_wrapper.py | 28 +++++++++++++++-------------
 2 files changed, 28 insertions(+), 30 deletions(-)

### fix: Update dataset preparation UI and manifest generation logic
**Author:** darklorddad
**Date:** Sun Oct 26 05:13:42 2025 +0800



 core/app.py            | 27 +++++++++++++++++++--------
 core/gradio_wrapper.py | 10 +++++-----
 2 files changed, 24 insertions(+), 13 deletions(-)

### feat: enhance dataset preparation UI and functionality
**Author:** darklorddad
**Date:** Sun Oct 26 04:54:38 2025 +0800



 core/app.py            | 35 ++++++++++++++++++++++++++---------
 core/gradio_wrapper.py |  9 ++++++++-
 2 files changed, 34 insertions(+), 10 deletions(-)

### feat: enhance dataset preparation with manifest options and split output directories
**Author:** darklorddad
**Date:** Sun Oct 26 04:44:31 2025 +0800



 core/app.py            | 14 +++++++++-----
 core/gradio_wrapper.py | 63 ++++++++++++++++++++++++++++++++++++++++++---------------------
 2 files changed, 51 insertions(+), 26 deletions(-)

### feat: add dataset splitting functionality to UI
**Author:** darklorddad
**Date:** Sun Oct 26 03:45:41 2025 +0800



 core/app.py            | 26 +++++++++++++++++++++++++-
 core/gradio_wrapper.py | 94 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 119 insertions(+), 1 deletion(-)

### feat: enhance dataset organisation to copy files
**Author:** darklorddad
**Date:** Sun Oct 26 02:37:38 2025 +0800



 core/gradio_wrapper.py | 35 +++++++++++++++++++++++++----------
 1 file changed, 25 insertions(+), 10 deletions(-)

### feat: auto-derive class names from source directory for dataset organisation
**Author:** darklorddad
**Date:** Sun Oct 26 02:20:44 2025 +0800



 core/app.py            | 12 ++++++------
 core/gradio_wrapper.py | 25 ++++++++++++++++---------
 2 files changed, 22 insertions(+), 15 deletions(-)

### style: Update accordion titles to use sentence case
**Author:** darklorddad
**Date:** Sun Oct 26 02:11:10 2025 +0800



 core/app.py | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### refactor: Reorganise dataset preparation tab with accordions
**Author:** darklorddad
**Date:** Sun Oct 26 02:09:43 2025 +0800



 core/app.py | 70 ++++++++++++++++++++++++++++++++++------------------------------------
 1 file changed, 34 insertions(+), 36 deletions(-)

### feat: add dataset organiser to dataset preparation tab
**Author:** darklorddad
**Date:** Sun Oct 26 02:08:26 2025 +0800



 core/app.py            | 24 +++++++++++++++++++++++-
 core/gradio_wrapper.py | 25 +++++++++++++++++++++++++
 2 files changed, 48 insertions(+), 1 deletion(-)

### fix: Handle directory path for manifest save and update placeholder text
**Author:** darklorddad
**Date:** Sun Oct 26 01:40:25 2025 +0800



 core/app.py            | 2 +-
 core/gradio_wrapper.py | 6 +++++-
 2 files changed, 6 insertions(+), 2 deletions(-)

### feat: default manifest save path to app.py directory
**Author:** darklorddad
**Date:** Sun Oct 26 01:38:42 2025 +0800



 core/app.py            | 2 +-
 core/gradio_wrapper.py | 4 +++-
 2 files changed, 4 insertions(+), 2 deletions(-)

### fix: Update manifest generation button text
**Author:** darklorddad
**Date:** Sun Oct 26 01:33:55 2025 +0800



 core/app.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### feat: allow custom manifest file save path
**Author:** darklorddad
**Date:** Sun Oct 26 01:30:21 2025 +0800



 core/app.py            |  6 +++++-
 core/gradio_wrapper.py | 13 +++++++++++--
 2 files changed, 16 insertions(+), 3 deletions(-)

### Merge branch 'main' of https://github.com/Uwe1209/SPS
**Author:** darklorddad
**Date:** Sun Oct 26 00:40:52 2025 +0800



### feat: add manifest file generation to dataset preparation tab
**Author:** darklorddad
**Date:** Sun Oct 26 00:18:17 2025 +0800



 core/app.py            | 16 ++++++++++++++--
 core/gradio_wrapper.py | 22 ++++++++++++++++++++++
 2 files changed, 36 insertions(+), 2 deletions(-)

### refactor: Reorder Gradio tabs for improved UX
**Author:** darklorddad
**Date:** Sun Oct 26 00:07:50 2025 +0800



 core/app.py | 40 ++++++++++++++++++++--------------------
 1 file changed, 20 insertions(+), 20 deletions(-)

### feat: add 'Dataset preparation' tab
**Author:** darklorddad
**Date:** Sun Oct 26 00:06:25 2025 +0800



 core/app.py | 3 +++
 1 file changed, 3 insertions(+)

### refactor: remove data preparation and analysis utilities
**Author:** darklorddad
**Date:** Sat Oct 25 23:33:46 2025 +0800



 core/app.py            |  77 +-----------------------------------------------------
 core/gradio_wrapper.py | 154 -----------------------------------------------------------------------------------------------------------
 core/utils.py          | 303 -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 3 files changed, 1 insertion(+), 533 deletions(-)

### fix: Capitalise "AutoTrain UI" in training tab buttons
**Author:** darklorddad
**Date:** Sat Oct 25 23:33:43 2025 +0800



 core/app.py | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### style: Standardise user-facing text capitalisation and remove ampersands
**Author:** darklorddad
**Date:** Sat Oct 25 23:10:52 2025 +0800



 core/app.py                                  | 94 +++++++++++++++++++++++++++++++++++++++++++++++-----------------------------------------------
 core/utilities/autotrain_dataset_splitter.py | 10 +++++-----
 core/utilities/check_balance.py              | 14 +++++++-------
 core/utilities/count_classes.py              | 14 +++++++-------
 core/utilities/directory_manifest.py         |  6 +++---
 core/utilities/normalise_class_names.py      |  8 ++++----
 core/utilities/normalise_image_names.py      |  8 ++++----
 core/utilities/organise_dataset.py           |  6 +++---
 core/utilities/plot_metrics.py               | 28 ++++++++++++++--------------
 core/utils.py                                | 74 +++++++++++++++++++++++++++++++++++++-------------------------------------
 10 files changed, 131 insertions(+), 131 deletions(-)

### refactor: Remove title from app
**Author:** darklorddad
**Date:** Sat Oct 25 23:00:19 2025 +0800



 core/app.py | 3 +--
 1 file changed, 1 insertion(+), 2 deletions(-)

### refactor: Rename bird classification to plant classification
**Author:** darklorddad
**Date:** Sat Oct 25 22:37:01 2025 +0800



 core/app.py                        | 10 +++++-----
 core/gradio_wrapper.py             |  2 +-
 core/utilities/check_balance.py    |  2 +-
 core/utilities/organise_dataset.py |  2 +-
 4 files changed, 8 insertions(+), 8 deletions(-)

### feat: Add Gradio UI for bird classification and dataset utilities
**Author:** darklorddad
**Date:** Sat Oct 25 22:31:56 2025 +0800



 Documents/Discussion-reports/Architectural-Foundations-of-Multimodal-Large-Language-Models.md |  85 ++++++++++++
 core/AutoTrain-requirements.txt                                                               |  49 +++++++
 core/LICENSE                                                                                  | 661 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 core/app.py                                                                                   | 182 ++++++++++++++++++++++++++
 core/autotrain/__init__.py                                                                    |  76 +++++++++++
 core/autotrain/app/__init__.py                                                                |   0
 core/autotrain/app/api_routes.py                                                              | 783 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 core/autotrain/app/app.py                                                                     |  43 +++++++
 core/autotrain/app/colab.py                                                                   | 402 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 core/autotrain/app/db.py                                                                      |  62 +++++++++
 core/autotrain/app/models.py                                                                  | 357 ++++++++++++++++++++++++++++++++++++++++++++++++++
 core/autotrain/app/oauth.py                                                                   | 172 +++++++++++++++++++++++++
 core/autotrain/app/params.py                                                                  | 739 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 core/autotrain/app/static/logo.png                                                            | Bin 0 -> 45750 bytes
 core/autotrain/app/static/scripts/fetch_data_and_update_models.js                             |  34 +++++
 core/autotrain/app/static/scripts/listeners.js                                                | 190 +++++++++++++++++++++++++++
 core/autotrain/app/static/scripts/logs.js                                                     |  62 +++++++++
 core/autotrain/app/static/scripts/poll.js                                                     |  70 ++++++++++
 core/autotrain/app/static/scripts/utils.js                                                    | 182 ++++++++++++++++++++++++++
 core/autotrain/app/templates/duplicate.html                                                   |  34 +++++
 core/autotrain/app/templates/error.html                                                       |  32 +++++
 core/autotrain/app/templates/index.html                                                       | 697 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 core/autotrain/app/templates/login.html                                                       |  55 ++++++++
 core/autotrain/app/training_api.py                                                            | 109 ++++++++++++++++
 core/autotrain/app/ui_routes.py                                                               | 809 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 core/autotrain/app/utils.py                                                                   | 180 ++++++++++++++++++++++++++
 core/autotrain/backends/__init__.py                                                           |   0
 core/autotrain/backends/base.py                                                               | 163 +++++++++++++++++++++++
 core/autotrain/backends/endpoints.py                                                          |  86 +++++++++++++
 core/autotrain/backends/local.py                                                              |  26 ++++
 core/autotrain/backends/ngc.py                                                                | 107 +++++++++++++++
 core/autotrain/backends/nvcf.py                                                               | 203 +++++++++++++++++++++++++++++
 core/autotrain/backends/spaces.py                                                             |  93 ++++++++++++++
 core/autotrain/cli/__init__.py                                                                |  13 ++
 core/autotrain/cli/autotrain.py                                                               |  72 +++++++++++
 core/autotrain/cli/run_api.py                                                                 |  70 ++++++++++
 core/autotrain/cli/run_app.py                                                                 | 169 ++++++++++++++++++++++++
 core/autotrain/cli/run_extractive_qa.py                                                       | 105 +++++++++++++++
 core/autotrain/cli/run_image_classification.py                                                | 113 ++++++++++++++++
 core/autotrain/cli/run_image_regression.py                                                    | 113 ++++++++++++++++
 core/autotrain/cli/run_llm.py                                                                 | 141 ++++++++++++++++++++
 core/autotrain/cli/run_object_detection.py                                                    | 113 ++++++++++++++++
 core/autotrain/cli/run_sent_tranformers.py                                                    | 113 ++++++++++++++++
 core/autotrain/cli/run_seq2seq.py                                                             |  97 ++++++++++++++
 core/autotrain/cli/run_setup.py                                                               |  53 ++++++++
 core/autotrain/cli/run_spacerunner.py                                                         | 143 +++++++++++++++++++++
 core/autotrain/cli/run_tabular.py                                                             | 106 +++++++++++++++
 core/autotrain/cli/run_text_classification.py                                                 | 106 +++++++++++++++
 core/autotrain/cli/run_text_regression.py                                                     | 106 +++++++++++++++
 core/autotrain/cli/run_token_classification.py                                                | 106 +++++++++++++++
 core/autotrain/cli/run_tools.py                                                               |  99 ++++++++++++++
 core/autotrain/cli/run_vlm.py                                                                 | 111 ++++++++++++++++
 core/autotrain/cli/utils.py                                                                   | 178 +++++++++++++++++++++++++
 core/autotrain/client.py                                                                      | 294 ++++++++++++++++++++++++++++++++++++++++++
 core/autotrain/commands.py                                                                    | 516 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 core/autotrain/config.py                                                                      |   4 +
 core/autotrain/dataset.py                                                                     | 812 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 core/autotrain/help.py                                                                        |  81 ++++++++++++
 core/autotrain/logging.py                                                                     |  61 +++++++++
 core/autotrain/params.py                                                                      |  12 ++
 core/autotrain/parser.py                                                                      | 229 +++++++++++++++++++++++++++++++++
 core/autotrain/preprocessor/__init__.py                                                       |   0
 core/autotrain/preprocessor/tabular.py                                                        | 273 +++++++++++++++++++++++++++++++++++++++
 core/autotrain/preprocessor/text.py                                                           | 828 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 core/autotrain/preprocessor/vision.py                                                         | 565 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 core/autotrain/preprocessor/vlm.py                                                            | 224 ++++++++++++++++++++++++++++++++
 core/autotrain/project.py                                                                     | 563 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 core/autotrain/tasks.py                                                                       |  36 ++++++
 core/autotrain/tests/test_cli.py                                                              |   0
 core/autotrain/tests/test_dummy.py                                                            |   2 +
 core/autotrain/tools/__init__.py                                                              |   0
 core/autotrain/tools/convert_to_kohya.py                                                      |  23 ++++
 core/autotrain/tools/merge_adapter.py                                                         |  68 ++++++++++
 core/autotrain/trainers/__init__.py                                                           |   0
 core/autotrain/trainers/clm/__init__.py                                                       |   0
 core/autotrain/trainers/clm/__main__.py                                                       |  53 ++++++++
 core/autotrain/trainers/clm/callbacks.py                                                      |  61 +++++++++
 core/autotrain/trainers/clm/params.py                                                         | 140 ++++++++++++++++++++
 core/autotrain/trainers/clm/train_clm_default.py                                              | 114 ++++++++++++++++
 core/autotrain/trainers/clm/train_clm_dpo.py                                                  | 118 +++++++++++++++++
 core/autotrain/trainers/clm/train_clm_orpo.py                                                 |  57 ++++++++
 core/autotrain/trainers/clm/train_clm_reward.py                                               | 124 ++++++++++++++++++
 core/autotrain/trainers/clm/train_clm_sft.py                                                  |  56 ++++++++
 core/autotrain/trainers/clm/utils.py                                                          | 993 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 core/autotrain/trainers/common.py                                                             | 386 +++++++++++++++++++++++++++++++++++++++++++++++++++++++
 core/autotrain/trainers/extractive_question_answering/__init__.py                             |   0
 core/autotrain/trainers/extractive_question_answering/__main__.py                             | 263 +++++++++++++++++++++++++++++++++++++
 core/autotrain/trainers/extractive_question_answering/dataset.py                              | 121 +++++++++++++++++
 core/autotrain/trainers/extractive_question_answering/params.py                               |  76 +++++++++++
 core/autotrain/trainers/extractive_question_answering/utils.py                                | 396 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 core/autotrain/trainers/generic/__init__.py                                                   |   0
 core/autotrain/trainers/generic/__main__.py                                                   |  58 +++++++++
 core/autotrain/trainers/generic/params.py                                                     |  36 ++++++
 core/autotrain/trainers/generic/utils.py                                                      | 201 +++++++++++++++++++++++++++++
 core/autotrain/trainers/image_classification/__init__.py                                      |   0
 core/autotrain/trainers/image_classification/__main__.py                                      | 252 ++++++++++++++++++++++++++++++++++++
 core/autotrain/trainers/image_classification/dataset.py                                       |  46 +++++++
 core/autotrain/trainers/image_classification/params.py                                        |  70 ++++++++++
 core/autotrain/trainers/image_classification/utils.py                                         | 232 +++++++++++++++++++++++++++++++++
 core/autotrain/trainers/image_regression/__init__.py                                          |   0
 core/autotrain/trainers/image_regression/__main__.py                                          | 226 ++++++++++++++++++++++++++++++++
 core/autotrain/trainers/image_regression/dataset.py                                           |  42 ++++++
 core/autotrain/trainers/image_regression/params.py                                            |  70 ++++++++++
 core/autotrain/trainers/image_regression/utils.py                                             | 174 +++++++++++++++++++++++++
 core/autotrain/trainers/object_detection/__init__.py                                          |   0
 core/autotrain/trainers/object_detection/__main__.py                                          | 236 ++++++++++++++++++++++++++++++++++
 core/autotrain/trainers/object_detection/dataset.py                                           |  60 +++++++++
 core/autotrain/trainers/object_detection/params.py                                            |  74 +++++++++++
 core/autotrain/trainers/object_detection/utils.py                                             | 270 ++++++++++++++++++++++++++++++++++++++
 core/autotrain/trainers/sent_transformers/__init__.py                                         |   0
 core/autotrain/trainers/sent_transformers/__main__.py                                         | 251 ++++++++++++++++++++++++++++++++++++
 core/autotrain/trainers/sent_transformers/params.py                                           |  84 ++++++++++++
 core/autotrain/trainers/sent_transformers/utils.py                                            | 159 +++++++++++++++++++++++
 core/autotrain/trainers/seq2seq/__init__.py                                                   |   0
 core/autotrain/trainers/seq2seq/__main__.py                                                   | 279 ++++++++++++++++++++++++++++++++++++++++
 core/autotrain/trainers/seq2seq/dataset.py                                                    |  41 ++++++
 core/autotrain/trainers/seq2seq/params.py                                                     |  88 +++++++++++++
 core/autotrain/trainers/seq2seq/utils.py                                                      |  98 ++++++++++++++
 core/autotrain/trainers/tabular/__init__.py                                                   |   0
 core/autotrain/trainers/tabular/__main__.py                                                   | 409 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 core/autotrain/trainers/tabular/params.py                                                     |  52 ++++++++
 core/autotrain/trainers/tabular/utils.py                                                      | 546 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 core/autotrain/trainers/text_classification/__init__.py                                       |   0
 core/autotrain/trainers/text_classification/__main__.py                                       | 239 ++++++++++++++++++++++++++++++++++
 core/autotrain/trainers/text_classification/dataset.py                                        |  65 ++++++++++
 core/autotrain/trainers/text_classification/params.py                                         |  72 +++++++++++
 core/autotrain/trainers/text_classification/utils.py                                          | 179 ++++++++++++++++++++++++++
 core/autotrain/trainers/text_regression/__init__.py                                           |   0
 core/autotrain/trainers/text_regression/__main__.py                                           | 229 +++++++++++++++++++++++++++++++++
 core/autotrain/trainers/text_regression/dataset.py                                            |  66 ++++++++++
 core/autotrain/trainers/text_regression/params.py                                             |  72 +++++++++++
 core/autotrain/trainers/text_regression/utils.py                                              | 118 +++++++++++++++++
 core/autotrain/trainers/token_classification/__init__.py                                      |   0
 core/autotrain/trainers/token_classification/__main__.py                                      | 235 +++++++++++++++++++++++++++++++++
 core/autotrain/trainers/token_classification/dataset.py                                       |  65 ++++++++++
 core/autotrain/trainers/token_classification/params.py                                        |  72 +++++++++++
 core/autotrain/trainers/token_classification/utils.py                                         |  98 ++++++++++++++
 core/autotrain/trainers/vlm/__init__.py                                                       |   0
 core/autotrain/trainers/vlm/__main__.py                                                       |  37 ++++++
 core/autotrain/trainers/vlm/dataset.py                                                        |   0
 core/autotrain/trainers/vlm/params.py                                                         | 101 +++++++++++++++
 core/autotrain/trainers/vlm/train_vlm_generic.py                                              |  98 ++++++++++++++
 core/autotrain/trainers/vlm/utils.py                                                          | 329 +++++++++++++++++++++++++++++++++++++++++++++++
 core/autotrain/utils.py                                                                       |  82 ++++++++++++
 core/gradio_wrapper.py                                                                        | 316 +++++++++++++++++++++++++++++++++++++++++++++
 core/launch_autotrain.py                                                                      |   5 +
 core/requirements.txt                                                                         |  50 +++++++
 core/utilities/autotrain_dataset_splitter.py                                                  | 236 ++++++++++++++++++++++++++++++++++
 core/utilities/check_balance.py                                                               | 141 ++++++++++++++++++++
 core/utilities/count_classes.py                                                               | 168 ++++++++++++++++++++++++
 core/utilities/directory_manifest.py                                                          | 100 ++++++++++++++
 core/utilities/normalise_class_names.py                                                       | 129 +++++++++++++++++++
 core/utilities/normalise_image_names.py                                                       | 205 +++++++++++++++++++++++++++++
 core/utilities/organise_dataset.py                                                            | 151 ++++++++++++++++++++++
 core/utilities/plot_metrics.py                                                                | 281 ++++++++++++++++++++++++++++++++++++++++
 core/utils.py                                                                                 | 385 ++++++++++++++++++++++++++++++++++++++++++++++++++++++
 156 files changed, 24797 insertions(+)

### Merge branch 'main' of https://github.com/Uwe1209/SPS
**Author:** darklorddad
**Date:** Sat Oct 25 22:24:04 2025 +0800



### refactor: Remove unused core modules and update gitignore
**Author:** darklorddad
**Date:** Sat Oct 25 22:24:01 2025 +0800



 .gitignore                    |  150 +++++++++++++++++++++++
 core/__init__.py              |    0
 core/evaluation.py            |  184 -----------------------------
 core/finetune.py              |  542 -----------------------------------------------------------------------------------
 core/finetune_efficientvit.py |  163 -------------------------
 core/gui.py                   | 1322 -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 core/inference.py             |   73 ------------
 core/process_dataset.py       |  205 --------------------------------
 8 files changed, 150 insertions(+), 2489 deletions(-)

### fix: Clip class weights to prevent instability from rare classes
**Author:** darklorddad
**Date:** Mon Oct 20 10:18:52 2025 +0800



 core/finetune.py | 7 ++++++-
 1 file changed, 6 insertions(+), 1 deletion(-)

### fix: Reduce default head learning rate in GUI to improve training stability
**Author:** darklorddad
**Date:** Mon Oct 20 09:33:16 2025 +0800



 core/gui.py | 6 +++---
 1 file changed, 3 insertions(+), 3 deletions(-)

### feat: Log fine-tuning parameters to console before starting
**Author:** darklorddad
**Date:** Mon Oct 20 09:11:59 2025 +0800



 core/finetune.py | 6 ++++++
 1 file changed, 6 insertions(+)

### feat: implement differential learning rates for fine-tuning
**Author:** darklorddad
**Date:** Mon Oct 20 09:09:31 2025 +0800



 core/finetune.py | 40 +++++++++++++++++++++++++++++++++-------
 core/gui.py      | 13 ++++++++-----
 2 files changed, 41 insertions(+), 12 deletions(-)

### fix: Set default tuning strategy to 'head_only' in GUI
**Author:** darklorddad
**Date:** Mon Oct 20 08:52:49 2025 +0800



 core/gui.py | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### fix: Separate weighted training and unweighted validation loss functions
**Author:** darklorddad
**Date:** Mon Oct 20 08:31:25 2025 +0800



 core/finetune.py | 18 +++++++++++-------
 1 file changed, 11 insertions(+), 7 deletions(-)

### fix: Adjust class weight calculation for stability
**Author:** darklorddad
**Date:** Mon Oct 20 08:00:45 2025 +0800



 core/finetune.py | 4 +++-
 1 file changed, 3 insertions(+), 1 deletion(-)

### feat: add fine-tuning strategy selection to GUI and core logic
**Author:** darklorddad
**Date:** Mon Oct 20 07:55:10 2025 +0800



 core/finetune.py | 29 ++++++++++++++++++++++++++---
 core/gui.py      | 16 +++++++++++++++-
 2 files changed, 41 insertions(+), 4 deletions(-)

### feat: Implement weighted loss for class imbalance in fine-tuning
**Author:** darklorddad
**Date:** Mon Oct 20 07:38:23 2025 +0800



 core/finetune.py | 23 +++++++++++++++++++----
 core/gui.py      | 11 +++++++++++
 2 files changed, 30 insertions(+), 4 deletions(-)

### feat: add learning rate scheduler to fine-tuning and GUI
**Author:** darklorddad
**Date:** Mon Oct 20 07:21:54 2025 +0800



 core/finetune.py | 17 +++++++++++++++++
 core/gui.py      | 20 ++++++++++++++++++++
 2 files changed, 37 insertions(+)

### fix: Establish early stopping baseline with initial validation metrics
**Author:** darklorddad
**Date:** Mon Oct 20 06:42:19 2025 +0800



 core/finetune.py | 21 +++++++++++++++++++++
 1 file changed, 21 insertions(+)

### fix: Save and load optimizer state for correct training resumption
**Author:** darklorddad
**Date:** Mon Oct 20 06:25:51 2025 +0800



 core/finetune.py | 7 +++++++
 1 file changed, 7 insertions(+)

### feat: display final validation accuracy after fine-tuning
**Author:** darklorddad
**Date:** Sun Oct 19 03:05:59 2025 +0800



 core/finetune.py | 26 +++++++++++++++++++++++++-
 core/gui.py      |  6 +++++-
 2 files changed, 30 insertions(+), 2 deletions(-)

### refactor: Remove evaluation and inference logic from finetuning
**Author:** darklorddad
**Date:** Sun Oct 19 02:58:56 2025 +0800



 core/finetune.py | 80 +-------------------------------------------------------------------------------
 1 file changed, 1 insertion(+), 79 deletions(-)

### feat: Remove evaluation and classify tabs from GUI
**Author:** darklorddad
**Date:** Sun Oct 19 01:25:08 2025 +0800



 core/finetune.py |   7 -------
 core/gui.py      | 213 ++-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 2 files changed, 2 insertions(+), 218 deletions(-)

### refactor: separate training and validation phases in fine-tuning loop
**Author:** darklorddad
**Date:** Sun Oct 19 00:16:31 2025 +0800



 core/finetune.py | 124 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++----------------------------------------------------
 1 file changed, 72 insertions(+), 52 deletions(-)

### feat: save fine-tuning evaluation results to files
**Author:** darklorddad
**Date:** Sun Oct 19 00:10:07 2025 +0800



 core/evaluation.py | 77 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 core/finetune.py   | 30 ++++++++++++++++++++----------
 2 files changed, 97 insertions(+), 10 deletions(-)

### fix: Improve responsiveness and cancellation during dataset loading
**Author:** darklorddad
**Date:** Sun Oct 19 00:01:54 2025 +0800



 core/finetune.py        | 9 +++++++--
 core/process_dataset.py | 8 ++++++++
 2 files changed, 15 insertions(+), 2 deletions(-)

### fix: Add cancellation checks to evaluation loops
**Author:** darklorddad
**Date:** Sat Oct 18 18:22:59 2025 +0800



 core/finetune.py | 6 ++++++
 1 file changed, 6 insertions(+)

### fix: Refine fine-tuning log messages for clarity and accuracy
**Author:** darklorddad
**Date:** Sat Oct 18 18:19:01 2025 +0800



 core/finetune.py | 2 +-
 core/gui.py      | 1 -
 2 files changed, 1 insertion(+), 2 deletions(-)

### fix: Simplify early stopping logic to ensure correct single-epoch training
**Author:** darklorddad
**Date:** Sat Oct 18 18:14:16 2025 +0800



 core/finetune.py | 11 ++++-------
 1 file changed, 4 insertions(+), 7 deletions(-)

### fix: Reduce logging frequency during fine-tuning to improve UI responsiveness
**Author:** darklorddad
**Date:** Sat Oct 18 18:01:04 2025 +0800



 core/finetune.py | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)

### fix: Defer memory cleanup to prevent undefined name errors
**Author:** darklorddad
**Date:** Sat Oct 18 17:43:15 2025 +0800



 core/finetune.py | 18 +++++++++---------
 1 file changed, 9 insertions(+), 9 deletions(-)

### fix: Improve fine-tuning completion, evaluation display, and memory release
**Author:** darklorddad
**Date:** Sat Oct 18 17:41:40 2025 +0800



 core/evaluation.py |  4 ++--
 core/finetune.py   |  9 +++++++++
 core/gui.py        | 20 ++++++++++++++------
 3 files changed, 25 insertions(+), 8 deletions(-)

### fix: Prevent race condition and remove duplicated resize_size logic in GUI
**Author:** darklorddad
**Date:** Sat Oct 18 17:30:08 2025 +0800



 core/gui.py | 18 +++++++++++-------
 1 file changed, 11 insertions(+), 7 deletions(-)

### feat: add detailed logging for fine-tuning setup phases
**Author:** darklorddad
**Date:** Sat Oct 18 17:22:33 2025 +0800



 core/finetune.py | 4 ++++
 1 file changed, 4 insertions(+)

### fix: Compress confusion matrices in eval results to reduce file size
**Author:** darklorddad
**Date:** Sat Oct 18 17:17:37 2025 +0800



 core/gui.py | 15 ++++++++++++++-
 1 file changed, 14 insertions(+), 1 deletion(-)

### chore: Remove CSV logging for fine-tuning results
**Author:** darklorddad
**Date:** Sat Oct 18 16:39:58 2025 +0800



 core/finetune.py | 39 ---------------------------------------
 1 file changed, 39 deletions(-)

### refactor: Persist and load evaluation results from file
**Author:** darklorddad
**Date:** Sat Oct 18 16:37:22 2025 +0800



 core/gui.py | 36 ++++++++++++++++++++++++++++++------
 1 file changed, 30 insertions(+), 6 deletions(-)

### fix: Use page.session for thread-safe evaluation results storage
**Author:** darklorddad
**Date:** Sat Oct 18 13:54:25 2025 +0800



 core/gui.py | 12 +++++++-----
 1 file changed, 7 insertions(+), 5 deletions(-)

### feat: Log fine-tuning results to a CSV file
**Author:** darklorddad
**Date:** Sat Oct 18 13:45:45 2025 +0800



 core/finetune.py | 39 +++++++++++++++++++++++++++++++++++++++
 1 file changed, 39 insertions(+)

### feat: Enhance logging verbosity and remove log frequency setting
**Author:** darklorddad
**Date:** Sat Oct 18 13:43:58 2025 +0800



 core/finetune.py        | 7 +------
 core/gui.py             | 6 +-----
 core/process_dataset.py | 9 ++++++---
 3 files changed, 8 insertions(+), 14 deletions(-)

### chore: Log GUI toast and text messages to console
**Author:** darklorddad
**Date:** Sat Oct 18 13:41:08 2025 +0800



 core/gui.py | 67 ++++++++++++++++++++++++++++++++++++++++++++++++++-----------------
 1 file changed, 50 insertions(+), 17 deletions(-)

### feat: Log all messages to terminal for verification
**Author:** darklorddad
**Date:** Sat Oct 18 13:37:24 2025 +0800



 core/finetune.py        |  3 +--
 core/inference.py       |  3 +--
 core/process_dataset.py | 53 +++++++++++++++++++++++------------------------------
 3 files changed, 25 insertions(+), 34 deletions(-)

### style: Remove full stop from progress message
**Author:** darklorddad
**Date:** Sat Oct 18 13:37:19 2025 +0800



 core/process_dataset.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### feat: Add script to fine-tune EfficientViT models
**Author:** darklorddad
**Date:** Sat Oct 18 13:36:10 2025 +0800



 core/finetune_efficientvit.py | 163 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 163 insertions(+)

### fix: Ensure best model state is loaded for evaluation when early stopping is active
**Author:** darklorddad
**Date:** Sat Oct 18 12:40:45 2025 +0800



 core/finetune.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### fix: Remove deprecated page.call and print finetuning results
**Author:** darklorddad
**Date:** Sat Oct 18 12:33:24 2025 +0800



 core/gui.py | 6 ++++--
 1 file changed, 4 insertions(+), 2 deletions(-)

### refactor: Rework evaluation result handling for thread safety
**Author:** darklorddad
**Date:** Sat Oct 18 00:13:01 2025 +0800



 core/gui.py | 46 ++++++++++++++++++++++++----------------------
 1 file changed, 24 insertions(+), 22 deletions(-)

### fix: Replace Flet session with global for eval results
**Author:** darklorddad
**Date:** Sat Oct 18 00:01:53 2025 +0800



 core/gui.py | 12 ++++++------
 1 file changed, 6 insertions(+), 6 deletions(-)

### fix: Persist evaluation results using session storage
**Author:** darklorddad
**Date:** Fri Oct 17 23:47:25 2025 +0800



 core/gui.py | 15 +++++++--------
 1 file changed, 7 insertions(+), 8 deletions(-)

### fix: Fix evaluation tab rendering and `resize_size` arg parsing
**Author:** darklorddad
**Date:** Fri Oct 17 23:33:32 2025 +0800



 core/finetune.py | 3 ++-
 core/gui.py      | 3 ++-
 2 files changed, 4 insertions(+), 2 deletions(-)

### fix: Ensure evaluation tab reliably displays results
**Author:** darklorddad
**Date:** Fri Oct 17 23:30:56 2025 +0800



 core/gui.py | 10 +++-------
 1 file changed, 3 insertions(+), 7 deletions(-)

### fix: Update evaluation tab content directly
**Author:** darklorddad
**Date:** Fri Oct 17 23:20:20 2025 +0800



 core/gui.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### fix: Ensure toast close button works and evaluation tab renders
**Author:** darklorddad
**Date:** Fri Oct 17 23:10:40 2025 +0800



 core/evaluation.py |  4 ++--
 core/gui.py        | 24 +++++++++++-------------
 2 files changed, 13 insertions(+), 15 deletions(-)

### Fix: Use dedicated container for evaluation tab content update
**Author:** darklorddad
**Date:** Fri Oct 17 23:08:53 2025 +0800



 core/gui.py | 16 ++++++++--------
 1 file changed, 8 insertions(+), 8 deletions(-)

### fix: Hide toast close button for active processes
**Author:** darklorddad
**Date:** Fri Oct 17 22:59:58 2025 +0800



 core/gui.py | 12 +++++++++++-
 1 file changed, 11 insertions(+), 1 deletion(-)

### fix: Defer evaluation chart rendering to prevent UI hang
**Author:** darklorddad
**Date:** Fri Oct 17 22:55:59 2025 +0800



 core/gui.py | 19 +++++++++++++------
 1 file changed, 13 insertions(+), 6 deletions(-)

### fix: Resolve PyTorch AMP and Matplotlib GUI warnings
**Author:** darklorddad
**Date:** Fri Oct 17 22:13:00 2025 +0800



 core/evaluation.py | 2 ++
 core/finetune.py   | 4 ++--
 2 files changed, 4 insertions(+), 2 deletions(-)

### style: Remove trailing full stops from messages
**Author:** darklorddad
**Date:** Fri Oct 17 22:12:57 2025 +0800



 core/evaluation.py |  4 ++--
 core/finetune.py   | 10 +++++-----
 2 files changed, 7 insertions(+), 7 deletions(-)

### fix: Fix UI hang when generating evaluation plots
**Author:** darklorddad
**Date:** Fri Oct 17 22:12:07 2025 +0800



 core/gui.py | 6 ++++--
 1 file changed, 4 insertions(+), 2 deletions(-)

### style: Remove trailing full stops from GUI messages
**Author:** darklorddad
**Date:** Fri Oct 17 22:12:04 2025 +0800



 core/gui.py | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### fix: Pre-create all class directories for consistent class indexing
**Author:** darklorddad
**Date:** Fri Oct 17 21:36:06 2025 +0800



 core/process_dataset.py | 11 ++++++++---
 1 file changed, 8 insertions(+), 3 deletions(-)

### fix: Provide all class labels to confusion matrix for correct dimensions
**Author:** darklorddad
**Date:** Fri Oct 17 21:30:49 2025 +0800



 core/finetune.py | 5 +++--
 1 file changed, 3 insertions(+), 2 deletions(-)

### style: Unify GUI text casing and punctuation
**Author:** darklorddad
**Date:** Fri Oct 17 21:25:39 2025 +0800



 core/gui.py | 40 ++++++++++++++++++++--------------------
 1 file changed, 20 insertions(+), 20 deletions(-)

### fix: Correct incorrect casing for Flet icons
**Author:** darklorddad
**Date:** Fri Oct 17 21:11:01 2025 +0800



 core/evaluation.py | 2 +-
 core/gui.py        | 2 +-
 2 files changed, 2 insertions(+), 2 deletions(-)

### Fix: Define GUI components before use in tabs
**Author:** darklorddad
**Date:** Fri Oct 17 21:02:23 2025 +0800



 core/gui.py | 130 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-----------------------------------------------------------------
 1 file changed, 65 insertions(+), 65 deletions(-)

### feat: Add Evaluation & Testing tabs; enhance fine-tune; improve toast
**Author:** darklorddad
**Date:** Fri Oct 17 21:00:48 2025 +0800



 core/evaluation.py | 105 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 core/finetune.py   |  94 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++--------------
 core/gui.py        | 202 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++--------------------------------
 core/inference.py  |  74 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 4 files changed, 429 insertions(+), 46 deletions(-)

### style: Adjust GUI labels to use sentence case
**Author:** darklorddad
**Date:** Fri Oct 17 21:00:39 2025 +0800



 core/gui.py | 24 ++++++++++++------------
 1 file changed, 12 insertions(+), 12 deletions(-)

### fix: Prevent seed fields from resetting on GUI card reset
**Author:** darklorddad
**Date:** Fri Oct 17 20:15:30 2025 +0800



 core/gui.py | 2 --
 1 file changed, 2 deletions(-)

### fix: Correct Flet icon attribute casing
**Author:** darklorddad
**Date:** Fri Oct 17 20:09:03 2025 +0800



 core/gui.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### refactor: Split reset_to_defaults into granular functions
**Author:** darklorddad
**Date:** Fri Oct 17 20:08:19 2025 +0800



 core/gui.py | 79 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-------------------
 1 file changed, 60 insertions(+), 19 deletions(-)

### feat: Implement per-card reset functionality for settings cards
**Author:** darklorddad
**Date:** Fri Oct 17 20:07:08 2025 +0800



 core/gui.py | 27 +++++++++------------------
 1 file changed, 9 insertions(+), 18 deletions(-)

### fix: Define reset_to_defaults function before use
**Author:** darklorddad
**Date:** Fri Oct 17 19:57:14 2025 +0800



 core/gui.py | 142 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-----------------------------------------------------------------------
 1 file changed, 71 insertions(+), 71 deletions(-)

### feat: Add 'Reset to Defaults' button and set optimal parameters
**Author:** darklorddad
**Date:** Fri Oct 17 19:55:03 2025 +0800



 core/gui.py | 98 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++---------
 1 file changed, 89 insertions(+), 9 deletions(-)

### refactor: Rename EfficientViT models documentation file
**Author:** darklorddad
**Date:** Fri Oct 17 19:50:13 2025 +0800



 Documents/{efficientvit_models.md => EfficientViT-models.md} | 0
 1 file changed, 0 insertions(+), 0 deletions(-)

### feat: Make CUDA device configurable via GUI and CLI
**Author:** darklorddad
**Date:** Fri Oct 17 19:36:37 2025 +0800



 core/finetune.py | 7 ++++++-
 core/gui.py      | 5 ++++-
 2 files changed, 10 insertions(+), 2 deletions(-)

### Remove node_modules from git cache
**Author:** darklorddad
**Date:** Fri Oct 17 18:40:25 2025 +0800



 backend/node_modules/.bin/mkdirp                                                           |   16 -
 backend/node_modules/.bin/mkdirp.cmd                                                       |   17 -
 backend/node_modules/.bin/mkdirp.ps1                                                       |   28 -
 backend/node_modules/.package-lock.json                                                    | 1015 ----------------
 backend/node_modules/accepts/HISTORY.md                                                    |  250 ----
 backend/node_modules/accepts/LICENSE                                                       |   23 -
 backend/node_modules/accepts/README.md                                                     |  140 ---
 backend/node_modules/accepts/index.js                                                      |  238 ----
 backend/node_modules/accepts/package.json                                                  |   47 -
 backend/node_modules/append-field/.npmignore                                               |    1 -
 backend/node_modules/append-field/LICENSE                                                  |   21 -
 backend/node_modules/append-field/README.md                                                |   44 -
 backend/node_modules/append-field/index.js                                                 |   12 -
 backend/node_modules/append-field/lib/parse-path.js                                        |   53 -
 backend/node_modules/append-field/lib/set-value.js                                         |   64 -
 backend/node_modules/append-field/package.json                                             |   19 -
 backend/node_modules/append-field/test/forms.js                                            |   19 -
 backend/node_modules/body-parser/HISTORY.md                                                |  731 ------------
 backend/node_modules/body-parser/LICENSE                                                   |   23 -
 backend/node_modules/body-parser/README.md                                                 |  491 --------
 backend/node_modules/body-parser/index.js                                                  |   80 --
 backend/node_modules/body-parser/lib/read.js                                               |  210 ----
 backend/node_modules/body-parser/lib/types/json.js                                         |  206 ----
 backend/node_modules/body-parser/lib/types/raw.js                                          |   75 --
 backend/node_modules/body-parser/lib/types/text.js                                         |   80 --
 backend/node_modules/body-parser/lib/types/urlencoded.js                                   |  177 ---
 backend/node_modules/body-parser/lib/utils.js                                              |   83 --
 backend/node_modules/body-parser/package.json                                              |   49 -
 backend/node_modules/buffer-from/LICENSE                                                   |   21 -
 backend/node_modules/buffer-from/index.js                                                  |   72 --
 backend/node_modules/buffer-from/package.json                                              |   19 -
 backend/node_modules/buffer-from/readme.md                                                 |   69 --
 backend/node_modules/busboy/.eslintrc.js                                                   |    5 -
 backend/node_modules/busboy/.github/workflows/ci.yml                                       |   24 -
 backend/node_modules/busboy/.github/workflows/lint.yml                                     |   23 -
 backend/node_modules/busboy/LICENSE                                                        |   19 -
 backend/node_modules/busboy/README.md                                                      |  191 ---
 backend/node_modules/busboy/bench/bench-multipart-fields-100mb-big.js                      |  149 ---
 backend/node_modules/busboy/bench/bench-multipart-fields-100mb-small.js                    |  143 ---
 backend/node_modules/busboy/bench/bench-multipart-files-100mb-big.js                       |  154 ---
 backend/node_modules/busboy/bench/bench-multipart-files-100mb-small.js                     |  148 ---
 backend/node_modules/busboy/bench/bench-urlencoded-fields-100pairs-small.js                |  101 --
 backend/node_modules/busboy/bench/bench-urlencoded-fields-900pairs-small-alt.js            |   84 --
 backend/node_modules/busboy/lib/index.js                                                   |   57 -
 backend/node_modules/busboy/lib/types/multipart.js                                         |  653 ----------
 backend/node_modules/busboy/lib/types/urlencoded.js                                        |  350 ------
 backend/node_modules/busboy/lib/utils.js                                                   |  596 ---------
 backend/node_modules/busboy/package.json                                                   |   22 -
 backend/node_modules/busboy/test/common.js                                                 |  109 --
 backend/node_modules/busboy/test/test-types-multipart-charsets.js                          |   94 --
 backend/node_modules/busboy/test/test-types-multipart-stream-pause.js                      |  102 --
 backend/node_modules/busboy/test/test-types-multipart.js                                   | 1053 ----------------
 backend/node_modules/busboy/test/test-types-urlencoded.js                                  |  488 --------
 backend/node_modules/busboy/test/test.js                                                   |   20 -
 backend/node_modules/bytes/History.md                                                      |   97 --
 backend/node_modules/bytes/LICENSE                                                         |   23 -
 backend/node_modules/bytes/Readme.md                                                       |  152 ---
 backend/node_modules/bytes/index.js                                                        |  170 ---
 backend/node_modules/bytes/package.json                                                    |   42 -
 backend/node_modules/call-bind-apply-helpers/.eslintrc                                     |   17 -
 backend/node_modules/call-bind-apply-helpers/.github/FUNDING.yml                           |   12 -
 backend/node_modules/call-bind-apply-helpers/.nycrc                                        |    9 -
 backend/node_modules/call-bind-apply-helpers/CHANGELOG.md                                  |   30 -
 backend/node_modules/call-bind-apply-helpers/LICENSE                                       |   21 -
 backend/node_modules/call-bind-apply-helpers/README.md                                     |   62 -
 backend/node_modules/call-bind-apply-helpers/actualApply.d.ts                              |    1 -
 backend/node_modules/call-bind-apply-helpers/actualApply.js                                |   10 -
 backend/node_modules/call-bind-apply-helpers/applyBind.d.ts                                |   19 -
 backend/node_modules/call-bind-apply-helpers/applyBind.js                                  |   10 -
 backend/node_modules/call-bind-apply-helpers/functionApply.d.ts                            |    1 -
 backend/node_modules/call-bind-apply-helpers/functionApply.js                              |    4 -
 backend/node_modules/call-bind-apply-helpers/functionCall.d.ts                             |    1 -
 backend/node_modules/call-bind-apply-helpers/functionCall.js                               |    4 -
 backend/node_modules/call-bind-apply-helpers/index.d.ts                                    |   64 -
 backend/node_modules/call-bind-apply-helpers/index.js                                      |   15 -
 backend/node_modules/call-bind-apply-helpers/package.json                                  |   85 --
 backend/node_modules/call-bind-apply-helpers/reflectApply.d.ts                             |    3 -
 backend/node_modules/call-bind-apply-helpers/reflectApply.js                               |    4 -
 backend/node_modules/call-bind-apply-helpers/test/index.js                                 |   63 -
 backend/node_modules/call-bind-apply-helpers/tsconfig.json                                 |    9 -
 backend/node_modules/call-bound/.eslintrc                                                  |   13 -
 backend/node_modules/call-bound/.github/FUNDING.yml                                        |   12 -
 backend/node_modules/call-bound/.nycrc                                                     |    9 -
 backend/node_modules/call-bound/CHANGELOG.md                                               |   42 -
 backend/node_modules/call-bound/LICENSE                                                    |   21 -
 backend/node_modules/call-bound/README.md                                                  |   53 -
 backend/node_modules/call-bound/index.d.ts                                                 |   94 --
 backend/node_modules/call-bound/index.js                                                   |   19 -
 backend/node_modules/call-bound/package.json                                               |   99 --
 backend/node_modules/call-bound/test/index.js                                              |   61 -
 backend/node_modules/call-bound/tsconfig.json                                              |   10 -
 backend/node_modules/concat-stream/LICENSE                                                 |   24 -
 backend/node_modules/concat-stream/index.js                                                |  144 ---
 backend/node_modules/concat-stream/package.json                                            |   55 -
 backend/node_modules/concat-stream/readme.md                                               |  102 --
 backend/node_modules/content-disposition/HISTORY.md                                        |   66 -
 backend/node_modules/content-disposition/LICENSE                                           |   22 -
 backend/node_modules/content-disposition/README.md                                         |  142 ---
 backend/node_modules/content-disposition/index.js                                          |  459 -------
 backend/node_modules/content-disposition/package.json                                      |   44 -
 backend/node_modules/content-type/HISTORY.md                                               |   29 -
 backend/node_modules/content-type/LICENSE                                                  |   22 -
 backend/node_modules/content-type/README.md                                                |   94 --
 backend/node_modules/content-type/index.js                                                 |  225 ----
 backend/node_modules/content-type/package.json                                             |   42 -
 backend/node_modules/cookie-signature/History.md                                           |   70 --
 backend/node_modules/cookie-signature/LICENSE                                              |   22 -
 backend/node_modules/cookie-signature/Readme.md                                            |   23 -
 backend/node_modules/cookie-signature/index.js                                             |   47 -
 backend/node_modules/cookie-signature/package.json                                         |   24 -
 backend/node_modules/cookie/LICENSE                                                        |   24 -
 backend/node_modules/cookie/README.md                                                      |  317 -----
 backend/node_modules/cookie/SECURITY.md                                                    |   25 -
 backend/node_modules/cookie/index.js                                                       |  335 ------
 backend/node_modules/cookie/package.json                                                   |   44 -
 backend/node_modules/debug/LICENSE                                                         |   20 -
 backend/node_modules/debug/README.md                                                       |  481 --------
 backend/node_modules/debug/package.json                                                    |   64 -
 backend/node_modules/debug/src/browser.js                                                  |  272 -----
 backend/node_modules/debug/src/common.js                                                   |  292 -----
 backend/node_modules/debug/src/index.js                                                    |   10 -
 backend/node_modules/debug/src/node.js                                                     |  263 ----
 backend/node_modules/depd/History.md                                                       |  103 --
 backend/node_modules/depd/LICENSE                                                          |   22 -
 backend/node_modules/depd/Readme.md                                                        |  280 -----
 backend/node_modules/depd/index.js                                                         |  538 ---------
 backend/node_modules/depd/lib/browser/index.js                                             |   77 --
 backend/node_modules/depd/package.json                                                     |   45 -
 backend/node_modules/dunder-proto/.eslintrc                                                |    5 -
 backend/node_modules/dunder-proto/.github/FUNDING.yml                                      |   12 -
 backend/node_modules/dunder-proto/.nycrc                                                   |   13 -
 backend/node_modules/dunder-proto/CHANGELOG.md                                             |   24 -
 backend/node_modules/dunder-proto/LICENSE                                                  |   21 -
 backend/node_modules/dunder-proto/README.md                                                |   54 -
 backend/node_modules/dunder-proto/get.d.ts                                                 |    5 -
 backend/node_modules/dunder-proto/get.js                                                   |   30 -
 backend/node_modules/dunder-proto/package.json                                             |   76 --
 backend/node_modules/dunder-proto/set.d.ts                                                 |    5 -
 backend/node_modules/dunder-proto/set.js                                                   |   35 -
 backend/node_modules/dunder-proto/test/get.js                                              |   34 -
 backend/node_modules/dunder-proto/test/index.js                                            |    4 -
 backend/node_modules/dunder-proto/test/set.js                                              |   50 -
 backend/node_modules/dunder-proto/tsconfig.json                                            |    9 -
 backend/node_modules/ee-first/LICENSE                                                      |   22 -
 backend/node_modules/ee-first/README.md                                                    |   80 --
 backend/node_modules/ee-first/index.js                                                     |   95 --
 backend/node_modules/ee-first/package.json                                                 |   29 -
 backend/node_modules/encodeurl/LICENSE                                                     |   22 -
 backend/node_modules/encodeurl/README.md                                                   |  109 --
 backend/node_modules/encodeurl/index.js                                                    |   60 -
 backend/node_modules/encodeurl/package.json                                                |   40 -
 backend/node_modules/es-define-property/.eslintrc                                          |   13 -
 backend/node_modules/es-define-property/.github/FUNDING.yml                                |   12 -
 backend/node_modules/es-define-property/.nycrc                                             |    9 -
 backend/node_modules/es-define-property/CHANGELOG.md                                       |   29 -
 backend/node_modules/es-define-property/LICENSE                                            |   21 -
 backend/node_modules/es-define-property/README.md                                          |   49 -
 backend/node_modules/es-define-property/index.d.ts                                         |    3 -
 backend/node_modules/es-define-property/index.js                                           |   14 -
 backend/node_modules/es-define-property/package.json                                       |   81 --
 backend/node_modules/es-define-property/test/index.js                                      |   56 -
 backend/node_modules/es-define-property/tsconfig.json                                      |   10 -
 backend/node_modules/es-errors/.eslintrc                                                   |    5 -
 backend/node_modules/es-errors/.github/FUNDING.yml                                         |   12 -
 backend/node_modules/es-errors/CHANGELOG.md                                                |   40 -
 backend/node_modules/es-errors/LICENSE                                                     |   21 -
 backend/node_modules/es-errors/README.md                                                   |   55 -
 backend/node_modules/es-errors/eval.d.ts                                                   |    3 -
 backend/node_modules/es-errors/eval.js                                                     |    4 -
 backend/node_modules/es-errors/index.d.ts                                                  |    3 -
 backend/node_modules/es-errors/index.js                                                    |    4 -
 backend/node_modules/es-errors/package.json                                                |   80 --
 backend/node_modules/es-errors/range.d.ts                                                  |    3 -
 backend/node_modules/es-errors/range.js                                                    |    4 -
 backend/node_modules/es-errors/ref.d.ts                                                    |    3 -
 backend/node_modules/es-errors/ref.js                                                      |    4 -
 backend/node_modules/es-errors/syntax.d.ts                                                 |    3 -
 backend/node_modules/es-errors/syntax.js                                                   |    4 -
 backend/node_modules/es-errors/test/index.js                                               |   19 -
 backend/node_modules/es-errors/tsconfig.json                                               |   49 -
 backend/node_modules/es-errors/type.d.ts                                                   |    3 -
 backend/node_modules/es-errors/type.js                                                     |    4 -
 backend/node_modules/es-errors/uri.d.ts                                                    |    3 -
 backend/node_modules/es-errors/uri.js                                                      |    4 -
 backend/node_modules/es-object-atoms/.eslintrc                                             |   16 -
 backend/node_modules/es-object-atoms/.github/FUNDING.yml                                   |   12 -
 backend/node_modules/es-object-atoms/CHANGELOG.md                                          |   37 -
 backend/node_modules/es-object-atoms/LICENSE                                               |   21 -
 backend/node_modules/es-object-atoms/README.md                                             |   63 -
 backend/node_modules/es-object-atoms/RequireObjectCoercible.d.ts                           |    3 -
 backend/node_modules/es-object-atoms/RequireObjectCoercible.js                             |   11 -
 backend/node_modules/es-object-atoms/ToObject.d.ts                                         |    7 -
 backend/node_modules/es-object-atoms/ToObject.js                                           |   10 -
 backend/node_modules/es-object-atoms/index.d.ts                                            |    3 -
 backend/node_modules/es-object-atoms/index.js                                              |    4 -
 backend/node_modules/es-object-atoms/isObject.d.ts                                         |    3 -
 backend/node_modules/es-object-atoms/isObject.js                                           |    6 -
 backend/node_modules/es-object-atoms/package.json                                          |   80 --
 backend/node_modules/es-object-atoms/test/index.js                                         |   38 -
 backend/node_modules/es-object-atoms/tsconfig.json                                         |    6 -
 backend/node_modules/escape-html/LICENSE                                                   |   24 -
 backend/node_modules/escape-html/Readme.md                                                 |   43 -
 backend/node_modules/escape-html/index.js                                                  |   78 --
 backend/node_modules/escape-html/package.json                                              |   24 -
 backend/node_modules/etag/HISTORY.md                                                       |   83 --
 backend/node_modules/etag/LICENSE                                                          |   22 -
 backend/node_modules/etag/README.md                                                        |  159 ---
 backend/node_modules/etag/index.js                                                         |  131 --
 backend/node_modules/etag/package.json                                                     |   47 -
 backend/node_modules/express/History.md                                                    | 3858 -----------------------------------------------------------
 backend/node_modules/express/LICENSE                                                       |   24 -
 backend/node_modules/express/Readme.md                                                     |  266 -----
 backend/node_modules/express/index.js                                                      |   11 -
 backend/node_modules/express/lib/application.js                                            |  631 ----------
 backend/node_modules/express/lib/express.js                                                |   81 --
 backend/node_modules/express/lib/request.js                                                |  515 --------
 backend/node_modules/express/lib/response.js                                               | 1039 ----------------
 backend/node_modules/express/lib/utils.js                                                  |  269 -----
 backend/node_modules/express/lib/view.js                                                   |  205 ----
 backend/node_modules/express/package.json                                                  |   98 --
 backend/node_modules/finalhandler/HISTORY.md                                               |  233 ----
 backend/node_modules/finalhandler/LICENSE                                                  |   22 -
 backend/node_modules/finalhandler/README.md                                                |  147 ---
 backend/node_modules/finalhandler/index.js                                                 |  293 -----
 backend/node_modules/finalhandler/package.json                                             |   43 -
 backend/node_modules/forwarded/HISTORY.md                                                  |   21 -
 backend/node_modules/forwarded/LICENSE                                                     |   22 -
 backend/node_modules/forwarded/README.md                                                   |   57 -
 backend/node_modules/forwarded/index.js                                                    |   90 --
 backend/node_modules/forwarded/package.json                                                |   45 -
 backend/node_modules/fresh/HISTORY.md                                                      |   80 --
 backend/node_modules/fresh/LICENSE                                                         |   23 -
 backend/node_modules/fresh/README.md                                                       |  117 --
 backend/node_modules/fresh/index.js                                                        |  136 ---
 backend/node_modules/fresh/package.json                                                    |   46 -
 backend/node_modules/function-bind/.eslintrc                                               |   21 -
 backend/node_modules/function-bind/.github/FUNDING.yml                                     |   12 -
 backend/node_modules/function-bind/.github/SECURITY.md                                     |    3 -
 backend/node_modules/function-bind/.nycrc                                                  |   13 -
 backend/node_modules/function-bind/CHANGELOG.md                                            |  136 ---
 backend/node_modules/function-bind/LICENSE                                                 |   20 -
 backend/node_modules/function-bind/README.md                                               |   46 -
 backend/node_modules/function-bind/implementation.js                                       |   84 --
 backend/node_modules/function-bind/index.js                                                |    5 -
 backend/node_modules/function-bind/package.json                                            |   87 --
 backend/node_modules/function-bind/test/.eslintrc                                          |    9 -
 backend/node_modules/function-bind/test/index.js                                           |  252 ----
 backend/node_modules/get-intrinsic/.eslintrc                                               |   42 -
 backend/node_modules/get-intrinsic/.github/FUNDING.yml                                     |   12 -
 backend/node_modules/get-intrinsic/.nycrc                                                  |    9 -
 backend/node_modules/get-intrinsic/CHANGELOG.md                                            |  186 ---
 backend/node_modules/get-intrinsic/LICENSE                                                 |   21 -
 backend/node_modules/get-intrinsic/README.md                                               |   71 --
 backend/node_modules/get-intrinsic/index.js                                                |  378 ------
 backend/node_modules/get-intrinsic/package.json                                            |   97 --
 backend/node_modules/get-intrinsic/test/GetIntrinsic.js                                    |  274 -----
 backend/node_modules/get-proto/.eslintrc                                                   |   10 -
 backend/node_modules/get-proto/.github/FUNDING.yml                                         |   12 -
 backend/node_modules/get-proto/.nycrc                                                      |    9 -
 backend/node_modules/get-proto/CHANGELOG.md                                                |   21 -
 backend/node_modules/get-proto/LICENSE                                                     |   21 -
 backend/node_modules/get-proto/Object.getPrototypeOf.d.ts                                  |    5 -
 backend/node_modules/get-proto/Object.getPrototypeOf.js                                    |    6 -
 backend/node_modules/get-proto/README.md                                                   |   50 -
 backend/node_modules/get-proto/Reflect.getPrototypeOf.d.ts                                 |    3 -
 backend/node_modules/get-proto/Reflect.getPrototypeOf.js                                   |    4 -
 backend/node_modules/get-proto/index.d.ts                                                  |    5 -
 backend/node_modules/get-proto/index.js                                                    |   27 -
 backend/node_modules/get-proto/package.json                                                |   81 --
 backend/node_modules/get-proto/test/index.js                                               |   68 --
 backend/node_modules/get-proto/tsconfig.json                                               |    9 -
 backend/node_modules/gopd/.eslintrc                                                        |   16 -
 backend/node_modules/gopd/.github/FUNDING.yml                                              |   12 -
 backend/node_modules/gopd/CHANGELOG.md                                                     |   45 -
 backend/node_modules/gopd/LICENSE                                                          |   21 -
 backend/node_modules/gopd/README.md                                                        |   40 -
 backend/node_modules/gopd/gOPD.d.ts                                                        |    1 -
 backend/node_modules/gopd/gOPD.js                                                          |    4 -
 backend/node_modules/gopd/index.d.ts                                                       |    5 -
 backend/node_modules/gopd/index.js                                                         |   15 -
 backend/node_modules/gopd/package.json                                                     |   77 --
 backend/node_modules/gopd/test/index.js                                                    |   36 -
 backend/node_modules/gopd/tsconfig.json                                                    |    9 -
 backend/node_modules/has-symbols/.eslintrc                                                 |   11 -
 backend/node_modules/has-symbols/.github/FUNDING.yml                                       |   12 -
 backend/node_modules/has-symbols/.nycrc                                                    |    9 -
 backend/node_modules/has-symbols/CHANGELOG.md                                              |   91 --
 backend/node_modules/has-symbols/LICENSE                                                   |   21 -
 backend/node_modules/has-symbols/README.md                                                 |   46 -
 backend/node_modules/has-symbols/index.d.ts                                                |    3 -
 backend/node_modules/has-symbols/index.js                                                  |   14 -
 backend/node_modules/has-symbols/package.json                                              |  111 --
 backend/node_modules/has-symbols/shams.d.ts                                                |    3 -
 backend/node_modules/has-symbols/shams.js                                                  |   45 -
 backend/node_modules/has-symbols/test/index.js                                             |   22 -
 backend/node_modules/has-symbols/test/shams/core-js.js                                     |   29 -
 backend/node_modules/has-symbols/test/shams/get-own-property-symbols.js                    |   29 -
 backend/node_modules/has-symbols/test/tests.js                                             |   58 -
 backend/node_modules/has-symbols/tsconfig.json                                             |   10 -
 backend/node_modules/hasown/.eslintrc                                                      |    5 -
 backend/node_modules/hasown/.github/FUNDING.yml                                            |   12 -
 backend/node_modules/hasown/.nycrc                                                         |   13 -
 backend/node_modules/hasown/CHANGELOG.md                                                   |   40 -
 backend/node_modules/hasown/LICENSE                                                        |   21 -
 backend/node_modules/hasown/README.md                                                      |   40 -
 backend/node_modules/hasown/index.d.ts                                                     |    3 -
 backend/node_modules/hasown/index.js                                                       |    8 -
 backend/node_modules/hasown/package.json                                                   |   92 --
 backend/node_modules/hasown/tsconfig.json                                                  |    6 -
 backend/node_modules/http-errors/HISTORY.md                                                |  180 ---
 backend/node_modules/http-errors/LICENSE                                                   |   23 -
 backend/node_modules/http-errors/README.md                                                 |  169 ---
 backend/node_modules/http-errors/index.js                                                  |  289 -----
 backend/node_modules/http-errors/node_modules/statuses/HISTORY.md                          |   82 --
 backend/node_modules/http-errors/node_modules/statuses/LICENSE                             |   23 -
 backend/node_modules/http-errors/node_modules/statuses/README.md                           |  136 ---
 backend/node_modules/http-errors/node_modules/statuses/codes.json                          |   65 -
 backend/node_modules/http-errors/node_modules/statuses/index.js                            |  146 ---
 backend/node_modules/http-errors/node_modules/statuses/package.json                        |   49 -
 backend/node_modules/http-errors/package.json                                              |   50 -
 backend/node_modules/iconv-lite/.github/dependabot.yml                                     |   11 -
 backend/node_modules/iconv-lite/.idea/codeStyles/Project.xml                               |   47 -
 backend/node_modules/iconv-lite/.idea/codeStyles/codeStyleConfig.xml                       |    5 -
 backend/node_modules/iconv-lite/.idea/iconv-lite.iml                                       |   12 -
 backend/node_modules/iconv-lite/.idea/inspectionProfiles/Project_Default.xml               |    6 -
 backend/node_modules/iconv-lite/.idea/modules.xml                                          |    8 -
 backend/node_modules/iconv-lite/.idea/vcs.xml                                              |    6 -
 backend/node_modules/iconv-lite/Changelog.md                                               |  212 ----
 backend/node_modules/iconv-lite/LICENSE                                                    |   21 -
 backend/node_modules/iconv-lite/README.md                                                  |  130 --
 backend/node_modules/iconv-lite/encodings/dbcs-codec.js                                    |  597 ----------
 backend/node_modules/iconv-lite/encodings/dbcs-data.js                                     |  188 ---
 backend/node_modules/iconv-lite/encodings/index.js                                         |   23 -
 backend/node_modules/iconv-lite/encodings/internal.js                                      |  198 ---
 backend/node_modules/iconv-lite/encodings/sbcs-codec.js                                    |   72 --
 backend/node_modules/iconv-lite/encodings/sbcs-data-generated.js                           |  451 -------
 backend/node_modules/iconv-lite/encodings/sbcs-data.js                                     |  179 ---
 backend/node_modules/iconv-lite/encodings/tables/big5-added.json                           |  122 --
 backend/node_modules/iconv-lite/encodings/tables/cp936.json                                |  264 ----
 backend/node_modules/iconv-lite/encodings/tables/cp949.json                                |  273 -----
 backend/node_modules/iconv-lite/encodings/tables/cp950.json                                |  177 ---
 backend/node_modules/iconv-lite/encodings/tables/eucjp.json                                |  182 ---
 backend/node_modules/iconv-lite/encodings/tables/gb18030-ranges.json                       |    1 -
 backend/node_modules/iconv-lite/encodings/tables/gbk-added.json                            |   56 -
 backend/node_modules/iconv-lite/encodings/tables/shiftjis.json                             |  125 --
 backend/node_modules/iconv-lite/encodings/utf16.js                                         |  197 ---
 backend/node_modules/iconv-lite/encodings/utf32.js                                         |  319 -----
 backend/node_modules/iconv-lite/encodings/utf7.js                                          |  290 -----
 backend/node_modules/iconv-lite/lib/bom-handling.js                                        |   52 -
 backend/node_modules/iconv-lite/lib/index.d.ts                                             |   41 -
 backend/node_modules/iconv-lite/lib/index.js                                               |  180 ---
 backend/node_modules/iconv-lite/lib/streams.js                                             |  109 --
 backend/node_modules/iconv-lite/package.json                                               |   44 -
 backend/node_modules/inherits/LICENSE                                                      |   16 -
 backend/node_modules/inherits/README.md                                                    |   42 -
 backend/node_modules/inherits/inherits.js                                                  |    9 -
 backend/node_modules/inherits/inherits_browser.js                                          |   27 -
 backend/node_modules/inherits/package.json                                                 |   29 -
 backend/node_modules/ipaddr.js/LICENSE                                                     |   19 -
 backend/node_modules/ipaddr.js/README.md                                                   |  233 ----
 backend/node_modules/ipaddr.js/ipaddr.min.js                                               |    1 -
 backend/node_modules/ipaddr.js/lib/ipaddr.js                                               |  673 -----------
 backend/node_modules/ipaddr.js/lib/ipaddr.js.d.ts                                          |   68 --
 backend/node_modules/ipaddr.js/package.json                                                |   35 -
 backend/node_modules/is-promise/LICENSE                                                    |   19 -
 backend/node_modules/is-promise/index.d.ts                                                 |    2 -
 backend/node_modules/is-promise/index.js                                                   |    6 -
 backend/node_modules/is-promise/index.mjs                                                  |    3 -
 backend/node_modules/is-promise/package.json                                               |   30 -
 backend/node_modules/is-promise/readme.md                                                  |   33 -
 backend/node_modules/math-intrinsics/.eslintrc                                             |   16 -
 backend/node_modules/math-intrinsics/.github/FUNDING.yml                                   |   12 -
 backend/node_modules/math-intrinsics/CHANGELOG.md                                          |   24 -
 backend/node_modules/math-intrinsics/LICENSE                                               |   21 -
 backend/node_modules/math-intrinsics/README.md                                             |   50 -
 backend/node_modules/math-intrinsics/abs.d.ts                                              |    1 -
 backend/node_modules/math-intrinsics/abs.js                                                |    4 -
 backend/node_modules/math-intrinsics/constants/maxArrayLength.d.ts                         |    3 -
 backend/node_modules/math-intrinsics/constants/maxArrayLength.js                           |    4 -
 backend/node_modules/math-intrinsics/constants/maxSafeInteger.d.ts                         |    3 -
 backend/node_modules/math-intrinsics/constants/maxSafeInteger.js                           |    5 -
 backend/node_modules/math-intrinsics/constants/maxValue.d.ts                               |    3 -
 backend/node_modules/math-intrinsics/constants/maxValue.js                                 |    5 -
 backend/node_modules/math-intrinsics/floor.d.ts                                            |    1 -
 backend/node_modules/math-intrinsics/floor.js                                              |    4 -
 backend/node_modules/math-intrinsics/isFinite.d.ts                                         |    3 -
 backend/node_modules/math-intrinsics/isFinite.js                                           |   12 -
 backend/node_modules/math-intrinsics/isInteger.d.ts                                        |    3 -
 backend/node_modules/math-intrinsics/isInteger.js                                          |   16 -
 backend/node_modules/math-intrinsics/isNaN.d.ts                                            |    1 -
 backend/node_modules/math-intrinsics/isNaN.js                                              |    6 -
 backend/node_modules/math-intrinsics/isNegativeZero.d.ts                                   |    3 -
 backend/node_modules/math-intrinsics/isNegativeZero.js                                     |    6 -
 backend/node_modules/math-intrinsics/max.d.ts                                              |    1 -
 backend/node_modules/math-intrinsics/max.js                                                |    4 -
 backend/node_modules/math-intrinsics/min.d.ts                                              |    1 -
 backend/node_modules/math-intrinsics/min.js                                                |    4 -
 backend/node_modules/math-intrinsics/mod.d.ts                                              |    3 -
 backend/node_modules/math-intrinsics/mod.js                                                |    9 -
 backend/node_modules/math-intrinsics/package.json                                          |   86 --
 backend/node_modules/math-intrinsics/pow.d.ts                                              |    1 -
 backend/node_modules/math-intrinsics/pow.js                                                |    4 -
 backend/node_modules/math-intrinsics/round.d.ts                                            |    1 -
 backend/node_modules/math-intrinsics/round.js                                              |    4 -
 backend/node_modules/math-intrinsics/sign.d.ts                                             |    3 -
 backend/node_modules/math-intrinsics/sign.js                                               |   11 -
 backend/node_modules/math-intrinsics/test/index.js                                         |  192 ---
 backend/node_modules/math-intrinsics/tsconfig.json                                         |    3 -
 backend/node_modules/media-typer/HISTORY.md                                                |   50 -
 backend/node_modules/media-typer/LICENSE                                                   |   22 -
 backend/node_modules/media-typer/README.md                                                 |   93 --
 backend/node_modules/media-typer/index.js                                                  |  143 ---
 backend/node_modules/media-typer/package.json                                              |   33 -
 backend/node_modules/merge-descriptors/index.d.ts                                          |   11 -
 backend/node_modules/merge-descriptors/index.js                                            |   26 -
 backend/node_modules/merge-descriptors/license                                             |   11 -
 backend/node_modules/merge-descriptors/package.json                                        |   50 -
 backend/node_modules/merge-descriptors/readme.md                                           |   55 -
 backend/node_modules/mime-db/HISTORY.md                                                    |  541 ---------
 backend/node_modules/mime-db/LICENSE                                                       |   23 -
 backend/node_modules/mime-db/README.md                                                     |  109 --
 backend/node_modules/mime-db/db.json                                                       | 9342 ----------------------------------------------------------------------------------------------------------------------------------------------
 backend/node_modules/mime-db/index.js                                                      |   12 -
 backend/node_modules/mime-db/package.json                                                  |   56 -
 backend/node_modules/mime-types/HISTORY.md                                                 |  421 -------
 backend/node_modules/mime-types/LICENSE                                                    |   23 -
 backend/node_modules/mime-types/README.md                                                  |  126 --
 backend/node_modules/mime-types/index.js                                                   |  211 ----
 backend/node_modules/mime-types/mimeScore.js                                               |   52 -
 backend/node_modules/mime-types/package.json                                               |   45 -
 backend/node_modules/minimist/.eslintrc                                                    |   29 -
 backend/node_modules/minimist/.github/FUNDING.yml                                          |   12 -
 backend/node_modules/minimist/.nycrc                                                       |   14 -
 backend/node_modules/minimist/CHANGELOG.md                                                 |  298 -----
 backend/node_modules/minimist/LICENSE                                                      |   18 -
 backend/node_modules/minimist/README.md                                                    |  121 --
 backend/node_modules/minimist/example/parse.js                                             |    4 -
 backend/node_modules/minimist/index.js                                                     |  263 ----
 backend/node_modules/minimist/package.json                                                 |   75 --
 backend/node_modules/minimist/test/all_bool.js                                             |   34 -
 backend/node_modules/minimist/test/bool.js                                                 |  177 ---
 backend/node_modules/minimist/test/dash.js                                                 |   43 -
 backend/node_modules/minimist/test/default_bool.js                                         |   37 -
 backend/node_modules/minimist/test/dotted.js                                               |   24 -
 backend/node_modules/minimist/test/kv_short.js                                             |   32 -
 backend/node_modules/minimist/test/long.js                                                 |   33 -
 backend/node_modules/minimist/test/num.js                                                  |   38 -
 backend/node_modules/minimist/test/parse.js                                                |  209 ----
 backend/node_modules/minimist/test/parse_modified.js                                       |   11 -
 backend/node_modules/minimist/test/proto.js                                                |   64 -
 backend/node_modules/minimist/test/short.js                                                |   69 --
 backend/node_modules/minimist/test/stop_early.js                                           |   17 -
 backend/node_modules/minimist/test/unknown.js                                              |  104 --
 backend/node_modules/minimist/test/whitespace.js                                           |   10 -
 backend/node_modules/mkdirp/LICENSE                                                        |   21 -
 backend/node_modules/mkdirp/bin/cmd.js                                                     |   33 -
 backend/node_modules/mkdirp/bin/usage.txt                                                  |   12 -
 backend/node_modules/mkdirp/index.js                                                       |  102 --
 backend/node_modules/mkdirp/package.json                                                   |   33 -
 backend/node_modules/mkdirp/readme.markdown                                                |  100 --
 backend/node_modules/ms/index.js                                                           |  162 ---
 backend/node_modules/ms/license.md                                                         |   21 -
 backend/node_modules/ms/package.json                                                       |   38 -
 backend/node_modules/ms/readme.md                                                          |   59 -
 backend/node_modules/multer/LICENSE                                                        |   17 -
 backend/node_modules/multer/README.md                                                      |  348 ------
 backend/node_modules/multer/index.js                                                       |  104 --
 backend/node_modules/multer/lib/counter.js                                                 |   28 -
 backend/node_modules/multer/lib/file-appender.js                                           |   67 --
 backend/node_modules/multer/lib/make-middleware.js                                         |  194 ---
 backend/node_modules/multer/lib/multer-error.js                                            |   24 -
 backend/node_modules/multer/lib/remove-uploaded-files.js                                   |   28 -
 backend/node_modules/multer/node_modules/media-typer/HISTORY.md                            |   22 -
 backend/node_modules/multer/node_modules/media-typer/LICENSE                               |   22 -
 backend/node_modules/multer/node_modules/media-typer/README.md                             |   81 --
 backend/node_modules/multer/node_modules/media-typer/index.js                              |  270 -----
 backend/node_modules/multer/node_modules/media-typer/package.json                          |   26 -
 backend/node_modules/multer/node_modules/mime-db/HISTORY.md                                |  507 --------
 backend/node_modules/multer/node_modules/mime-db/LICENSE                                   |   23 -
 backend/node_modules/multer/node_modules/mime-db/README.md                                 |  100 --
 backend/node_modules/multer/node_modules/mime-db/db.json                                   | 8519 ---------------------------------------------------------------------------------------------------------------------------------
 backend/node_modules/multer/node_modules/mime-db/index.js                                  |   12 -
 backend/node_modules/multer/node_modules/mime-db/package.json                              |   60 -
 backend/node_modules/multer/node_modules/mime-types/HISTORY.md                             |  397 ------
 backend/node_modules/multer/node_modules/mime-types/LICENSE                                |   23 -
 backend/node_modules/multer/node_modules/mime-types/README.md                              |  113 --
 backend/node_modules/multer/node_modules/mime-types/index.js                               |  188 ---
 backend/node_modules/multer/node_modules/mime-types/package.json                           |   44 -
 backend/node_modules/multer/node_modules/type-is/HISTORY.md                                |  259 ----
 backend/node_modules/multer/node_modules/type-is/LICENSE                                   |   23 -
 backend/node_modules/multer/node_modules/type-is/README.md                                 |  170 ---
 backend/node_modules/multer/node_modules/type-is/index.js                                  |  266 -----
 backend/node_modules/multer/node_modules/type-is/package.json                              |   45 -
 backend/node_modules/multer/package.json                                                   |   57 -
 backend/node_modules/multer/storage/disk.js                                                |   66 -
 backend/node_modules/multer/storage/memory.js                                              |   21 -
 backend/node_modules/negotiator/HISTORY.md                                                 |  114 --
 backend/node_modules/negotiator/LICENSE                                                    |   24 -
 backend/node_modules/negotiator/README.md                                                  |  212 ----
 backend/node_modules/negotiator/index.js                                                   |   83 --
 backend/node_modules/negotiator/lib/charset.js                                             |  169 ---
 backend/node_modules/negotiator/lib/encoding.js                                            |  205 ----
 backend/node_modules/negotiator/lib/language.js                                            |  179 ---
 backend/node_modules/negotiator/lib/mediaType.js                                           |  294 -----
 backend/node_modules/negotiator/package.json                                               |   43 -
 backend/node_modules/object-assign/index.js                                                |   90 --
 backend/node_modules/object-assign/license                                                 |   21 -
 backend/node_modules/object-assign/package.json                                            |   42 -
 backend/node_modules/object-assign/readme.md                                               |   61 -
 backend/node_modules/object-inspect/.eslintrc                                              |   53 -
 backend/node_modules/object-inspect/.github/FUNDING.yml                                    |   12 -
 backend/node_modules/object-inspect/.nycrc                                                 |   13 -
 backend/node_modules/object-inspect/CHANGELOG.md                                           |  424 -------
 backend/node_modules/object-inspect/LICENSE                                                |   21 -
 backend/node_modules/object-inspect/example/all.js                                         |   23 -
 backend/node_modules/object-inspect/example/circular.js                                    |    6 -
 backend/node_modules/object-inspect/example/fn.js                                          |    5 -
 backend/node_modules/object-inspect/example/inspect.js                                     |   10 -
 backend/node_modules/object-inspect/index.js                                               |  544 ---------
 backend/node_modules/object-inspect/package-support.json                                   |   20 -
 backend/node_modules/object-inspect/package.json                                           |  105 --
 backend/node_modules/object-inspect/readme.markdown                                        |   84 --
 backend/node_modules/object-inspect/test-core-js.js                                        |   26 -
 backend/node_modules/object-inspect/test/bigint.js                                         |   58 -
 backend/node_modules/object-inspect/test/browser/dom.js                                    |   15 -
 backend/node_modules/object-inspect/test/circular.js                                       |   16 -
 backend/node_modules/object-inspect/test/deep.js                                           |   12 -
 backend/node_modules/object-inspect/test/element.js                                        |   53 -
 backend/node_modules/object-inspect/test/err.js                                            |   48 -
 backend/node_modules/object-inspect/test/fakes.js                                          |   29 -
 backend/node_modules/object-inspect/test/fn.js                                             |   76 --
 backend/node_modules/object-inspect/test/global.js                                         |   17 -
 backend/node_modules/object-inspect/test/has.js                                            |   15 -
 backend/node_modules/object-inspect/test/holes.js                                          |   15 -
 backend/node_modules/object-inspect/test/indent-option.js                                  |  271 -----
 backend/node_modules/object-inspect/test/inspect.js                                        |  139 ---
 backend/node_modules/object-inspect/test/lowbyte.js                                        |   12 -
 backend/node_modules/object-inspect/test/number.js                                         |   58 -
 backend/node_modules/object-inspect/test/quoteStyle.js                                     |   26 -
 backend/node_modules/object-inspect/test/toStringTag.js                                    |   40 -
 backend/node_modules/object-inspect/test/undef.js                                          |   12 -
 backend/node_modules/object-inspect/test/values.js                                         |  261 ----
 backend/node_modules/object-inspect/util.inspect.js                                        |    1 -
 backend/node_modules/on-finished/HISTORY.md                                                |   98 --
 backend/node_modules/on-finished/LICENSE                                                   |   23 -
 backend/node_modules/on-finished/README.md                                                 |  162 ---
 backend/node_modules/on-finished/index.js                                                  |  234 ----
 backend/node_modules/on-finished/package.json                                              |   39 -
 backend/node_modules/once/LICENSE                                                          |   15 -
 backend/node_modules/once/README.md                                                        |   79 --
 backend/node_modules/once/once.js                                                          |   42 -
 backend/node_modules/once/package.json                                                     |   33 -
 backend/node_modules/parseurl/HISTORY.md                                                   |   58 -
 backend/node_modules/parseurl/LICENSE                                                      |   24 -
 backend/node_modules/parseurl/README.md                                                    |  133 ---
 backend/node_modules/parseurl/index.js                                                     |  158 ---
 backend/node_modules/parseurl/package.json                                                 |   40 -
 backend/node_modules/path-to-regexp/LICENSE                                                |   21 -
 backend/node_modules/path-to-regexp/Readme.md                                              |  224 ----
 backend/node_modules/path-to-regexp/dist/index.d.ts                                        |  144 ---
 backend/node_modules/path-to-regexp/dist/index.js                                          |  409 -------
 backend/node_modules/path-to-regexp/dist/index.js.map                                      |    1 -
 backend/node_modules/path-to-regexp/package.json                                           |   64 -
 backend/node_modules/proxy-addr/HISTORY.md                                                 |  161 ---
 backend/node_modules/proxy-addr/LICENSE                                                    |   22 -
 backend/node_modules/proxy-addr/README.md                                                  |  139 ---
 backend/node_modules/proxy-addr/index.js                                                   |  327 -----
 backend/node_modules/proxy-addr/package.json                                               |   47 -
 backend/node_modules/qs/.editorconfig                                                      |   46 -
 backend/node_modules/qs/.eslintrc                                                          |   39 -
 backend/node_modules/qs/.github/FUNDING.yml                                                |   12 -
 backend/node_modules/qs/.nycrc                                                             |   13 -
 backend/node_modules/qs/CHANGELOG.md                                                       |  622 ----------
 backend/node_modules/qs/LICENSE.md                                                         |   29 -
 backend/node_modules/qs/README.md                                                          |  733 ------------
 backend/node_modules/qs/dist/qs.js                                                         |  141 ---
 backend/node_modules/qs/lib/formats.js                                                     |   23 -
 backend/node_modules/qs/lib/index.js                                                       |   11 -
 backend/node_modules/qs/lib/parse.js                                                       |  328 -----
 backend/node_modules/qs/lib/stringify.js                                                   |  356 ------
 backend/node_modules/qs/lib/utils.js                                                       |  268 -----
 backend/node_modules/qs/package.json                                                       |   93 --
 backend/node_modules/qs/test/empty-keys-cases.js                                           |  267 -----
 backend/node_modules/qs/test/parse.js                                                      | 1276 --------------------
 backend/node_modules/qs/test/stringify.js                                                  | 1306 --------------------
 backend/node_modules/qs/test/utils.js                                                      |  262 ----
 backend/node_modules/range-parser/HISTORY.md                                               |   56 -
 backend/node_modules/range-parser/LICENSE                                                  |   23 -
 backend/node_modules/range-parser/README.md                                                |   84 --
 backend/node_modules/range-parser/index.js                                                 |  162 ---
 backend/node_modules/range-parser/package.json                                             |   44 -
 backend/node_modules/raw-body/HISTORY.md                                                   |  333 ------
 backend/node_modules/raw-body/LICENSE                                                      |   22 -
 backend/node_modules/raw-body/README.md                                                    |  223 ----
 backend/node_modules/raw-body/SECURITY.md                                                  |   24 -
 backend/node_modules/raw-body/index.d.ts                                                   |   85 --
 backend/node_modules/raw-body/index.js                                                     |  336 ------
 backend/node_modules/raw-body/node_modules/iconv-lite/Changelog.md                         |  236 ----
 backend/node_modules/raw-body/node_modules/iconv-lite/LICENSE                              |   21 -
 backend/node_modules/raw-body/node_modules/iconv-lite/README.md                            |  138 ---
 backend/node_modules/raw-body/node_modules/iconv-lite/encodings/dbcs-codec.js              |  532 ---------
 backend/node_modules/raw-body/node_modules/iconv-lite/encodings/dbcs-data.js               |  185 ---
 backend/node_modules/raw-body/node_modules/iconv-lite/encodings/index.js                   |   23 -
 backend/node_modules/raw-body/node_modules/iconv-lite/encodings/internal.js                |  218 ----
 backend/node_modules/raw-body/node_modules/iconv-lite/encodings/sbcs-codec.js              |   75 --
 backend/node_modules/raw-body/node_modules/iconv-lite/encodings/sbcs-data-generated.js     |  451 -------
 backend/node_modules/raw-body/node_modules/iconv-lite/encodings/sbcs-data.js               |  178 ---
 backend/node_modules/raw-body/node_modules/iconv-lite/encodings/tables/big5-added.json     |  122 --
 backend/node_modules/raw-body/node_modules/iconv-lite/encodings/tables/cp936.json          |  264 ----
 backend/node_modules/raw-body/node_modules/iconv-lite/encodings/tables/cp949.json          |  273 -----
 backend/node_modules/raw-body/node_modules/iconv-lite/encodings/tables/cp950.json          |  177 ---
 backend/node_modules/raw-body/node_modules/iconv-lite/encodings/tables/eucjp.json          |  182 ---
 backend/node_modules/raw-body/node_modules/iconv-lite/encodings/tables/gb18030-ranges.json |    1 -
 backend/node_modules/raw-body/node_modules/iconv-lite/encodings/tables/gbk-added.json      |   56 -
 backend/node_modules/raw-body/node_modules/iconv-lite/encodings/tables/shiftjis.json       |  125 --
 backend/node_modules/raw-body/node_modules/iconv-lite/encodings/utf16.js                   |  187 ---
 backend/node_modules/raw-body/node_modules/iconv-lite/encodings/utf32.js                   |  307 -----
 backend/node_modules/raw-body/node_modules/iconv-lite/encodings/utf7.js                    |  283 -----
 backend/node_modules/raw-body/node_modules/iconv-lite/lib/bom-handling.js                  |   48 -
 backend/node_modules/raw-body/node_modules/iconv-lite/lib/helpers/merge-exports.js         |   13 -
 backend/node_modules/raw-body/node_modules/iconv-lite/lib/index.d.ts                       |   41 -
 backend/node_modules/raw-body/node_modules/iconv-lite/lib/index.js                         |  183 ---
 backend/node_modules/raw-body/node_modules/iconv-lite/lib/streams.js                       |  105 --
 backend/node_modules/raw-body/node_modules/iconv-lite/package.json                         |   59 -
 backend/node_modules/raw-body/package.json                                                 |   50 -
 backend/node_modules/readable-stream/CONTRIBUTING.md                                       |   38 -
 backend/node_modules/readable-stream/GOVERNANCE.md                                         |  136 ---
 backend/node_modules/readable-stream/LICENSE                                               |   47 -
 backend/node_modules/readable-stream/README.md                                             |  106 --
 backend/node_modules/readable-stream/errors-browser.js                                     |  127 --
 backend/node_modules/readable-stream/errors.js                                             |  116 --
 backend/node_modules/readable-stream/experimentalWarning.js                                |   17 -
 backend/node_modules/readable-stream/lib/_stream_duplex.js                                 |  126 --
 backend/node_modules/readable-stream/lib/_stream_passthrough.js                            |   37 -
 backend/node_modules/readable-stream/lib/_stream_readable.js                               | 1027 ----------------
 backend/node_modules/readable-stream/lib/_stream_transform.js                              |  190 ---
 backend/node_modules/readable-stream/lib/_stream_writable.js                               |  641 ----------
 backend/node_modules/readable-stream/lib/internal/streams/async_iterator.js                |  180 ---
 backend/node_modules/readable-stream/lib/internal/streams/buffer_list.js                   |  183 ---
 backend/node_modules/readable-stream/lib/internal/streams/destroy.js                       |   96 --
 backend/node_modules/readable-stream/lib/internal/streams/end-of-stream.js                 |   86 --
 backend/node_modules/readable-stream/lib/internal/streams/from-browser.js                  |    3 -
 backend/node_modules/readable-stream/lib/internal/streams/from.js                          |   52 -
 backend/node_modules/readable-stream/lib/internal/streams/pipeline.js                      |   86 --
 backend/node_modules/readable-stream/lib/internal/streams/state.js                         |   22 -
 backend/node_modules/readable-stream/lib/internal/streams/stream-browser.js                |    1 -
 backend/node_modules/readable-stream/lib/internal/streams/stream.js                        |    1 -
 backend/node_modules/readable-stream/package.json                                          |   68 --
 backend/node_modules/readable-stream/readable-browser.js                                   |    9 -
 backend/node_modules/readable-stream/readable.js                                           |   16 -
 backend/node_modules/router/HISTORY.md                                                     |  228 ----
 backend/node_modules/router/LICENSE                                                        |   23 -
 backend/node_modules/router/README.md                                                      |  416 -------
 backend/node_modules/router/index.js                                                       |  748 ------------
 backend/node_modules/router/lib/layer.js                                                   |  247 ----
 backend/node_modules/router/lib/route.js                                                   |  242 ----
 backend/node_modules/router/package.json                                                   |   44 -
 backend/node_modules/safe-buffer/LICENSE                                                   |   21 -
 backend/node_modules/safe-buffer/README.md                                                 |  584 ---------
 backend/node_modules/safe-buffer/index.d.ts                                                |  187 ---
 backend/node_modules/safe-buffer/index.js                                                  |   65 -
 backend/node_modules/safe-buffer/package.json                                              |   51 -
 backend/node_modules/safer-buffer/LICENSE                                                  |   21 -
 backend/node_modules/safer-buffer/Porting-Buffer.md                                        |  268 -----
 backend/node_modules/safer-buffer/Readme.md                                                |  156 ---
 backend/node_modules/safer-buffer/dangerous.js                                             |   58 -
 backend/node_modules/safer-buffer/package.json                                             |   34 -
 backend/node_modules/safer-buffer/safer.js                                                 |   77 --
 backend/node_modules/safer-buffer/tests.js                                                 |  406 -------
 backend/node_modules/send/HISTORY.md                                                       |  580 ---------
 backend/node_modules/send/LICENSE                                                          |   23 -
 backend/node_modules/send/README.md                                                        |  317 -----
 backend/node_modules/send/index.js                                                         |  997 ----------------
 backend/node_modules/send/package.json                                                     |   60 -
 backend/node_modules/serve-static/HISTORY.md                                               |  516 --------
 backend/node_modules/serve-static/LICENSE                                                  |   25 -
 backend/node_modules/serve-static/README.md                                                |  253 ----
 backend/node_modules/serve-static/index.js                                                 |  208 ----
 backend/node_modules/serve-static/package.json                                             |   41 -
 backend/node_modules/setprototypeof/LICENSE                                                |   13 -
 backend/node_modules/setprototypeof/README.md                                              |   31 -
 backend/node_modules/setprototypeof/index.d.ts                                             |    2 -
 backend/node_modules/setprototypeof/index.js                                               |   17 -
 backend/node_modules/setprototypeof/package.json                                           |   38 -
 backend/node_modules/setprototypeof/test/index.js                                          |   24 -
 backend/node_modules/side-channel-list/.editorconfig                                       |    9 -
 backend/node_modules/side-channel-list/.eslintrc                                           |   11 -
 backend/node_modules/side-channel-list/.github/FUNDING.yml                                 |   12 -
 backend/node_modules/side-channel-list/.nycrc                                              |   13 -
 backend/node_modules/side-channel-list/CHANGELOG.md                                        |   15 -
 backend/node_modules/side-channel-list/LICENSE                                             |   21 -
 backend/node_modules/side-channel-list/README.md                                           |   62 -
 backend/node_modules/side-channel-list/index.d.ts                                          |   13 -
 backend/node_modules/side-channel-list/index.js                                            |  113 --
 backend/node_modules/side-channel-list/list.d.ts                                           |   14 -
 backend/node_modules/side-channel-list/package.json                                        |   77 --
 backend/node_modules/side-channel-list/test/index.js                                       |  104 --
 backend/node_modules/side-channel-list/tsconfig.json                                       |    9 -
 backend/node_modules/side-channel-map/.editorconfig                                        |    9 -
 backend/node_modules/side-channel-map/.eslintrc                                            |   11 -
 backend/node_modules/side-channel-map/.github/FUNDING.yml                                  |   12 -
 backend/node_modules/side-channel-map/.nycrc                                               |   13 -
 backend/node_modules/side-channel-map/CHANGELOG.md                                         |   22 -
 backend/node_modules/side-channel-map/LICENSE                                              |   21 -
 backend/node_modules/side-channel-map/README.md                                            |   62 -
 backend/node_modules/side-channel-map/index.d.ts                                           |   15 -
 backend/node_modules/side-channel-map/index.js                                             |   68 --
 backend/node_modules/side-channel-map/package.json                                         |   80 --
 backend/node_modules/side-channel-map/test/index.js                                        |  114 --
 backend/node_modules/side-channel-map/tsconfig.json                                        |    9 -
 backend/node_modules/side-channel-weakmap/.editorconfig                                    |    9 -
 backend/node_modules/side-channel-weakmap/.eslintrc                                        |   12 -
 backend/node_modules/side-channel-weakmap/.github/FUNDING.yml                              |   12 -
 backend/node_modules/side-channel-weakmap/.nycrc                                           |   13 -
 backend/node_modules/side-channel-weakmap/CHANGELOG.md                                     |   28 -
 backend/node_modules/side-channel-weakmap/LICENSE                                          |   21 -
 backend/node_modules/side-channel-weakmap/README.md                                        |   62 -
 backend/node_modules/side-channel-weakmap/index.d.ts                                       |   15 -
 backend/node_modules/side-channel-weakmap/index.js                                         |   84 --
 backend/node_modules/side-channel-weakmap/package.json                                     |   87 --
 backend/node_modules/side-channel-weakmap/test/index.js                                    |  114 --
 backend/node_modules/side-channel-weakmap/tsconfig.json                                    |    9 -
 backend/node_modules/side-channel/.editorconfig                                            |    9 -
 backend/node_modules/side-channel/.eslintrc                                                |   12 -
 backend/node_modules/side-channel/.github/FUNDING.yml                                      |   12 -
 backend/node_modules/side-channel/.nycrc                                                   |   13 -
 backend/node_modules/side-channel/CHANGELOG.md                                             |  110 --
 backend/node_modules/side-channel/LICENSE                                                  |   21 -
 backend/node_modules/side-channel/README.md                                                |   61 -
 backend/node_modules/side-channel/index.d.ts                                               |   14 -
 backend/node_modules/side-channel/index.js                                                 |   43 -
 backend/node_modules/side-channel/package.json                                             |   85 --
 backend/node_modules/side-channel/test/index.js                                            |  104 --
 backend/node_modules/side-channel/tsconfig.json                                            |    9 -
 backend/node_modules/statuses/HISTORY.md                                                   |   87 --
 backend/node_modules/statuses/LICENSE                                                      |   23 -
 backend/node_modules/statuses/README.md                                                    |  139 ---
 backend/node_modules/statuses/codes.json                                                   |   65 -
 backend/node_modules/statuses/index.js                                                     |  146 ---
 backend/node_modules/statuses/package.json                                                 |   49 -
 backend/node_modules/streamsearch/.eslintrc.js                                             |    5 -
 backend/node_modules/streamsearch/.github/workflows/ci.yml                                 |   24 -
 backend/node_modules/streamsearch/.github/workflows/lint.yml                               |   23 -
 backend/node_modules/streamsearch/LICENSE                                                  |   19 -
 backend/node_modules/streamsearch/README.md                                                |   95 --
 backend/node_modules/streamsearch/lib/sbmh.js                                              |  267 -----
 backend/node_modules/streamsearch/package.json                                             |   34 -
 backend/node_modules/streamsearch/test/test.js                                             |   70 --
 backend/node_modules/string_decoder/LICENSE                                                |   48 -
 backend/node_modules/string_decoder/README.md                                              |   47 -
 backend/node_modules/string_decoder/lib/string_decoder.js                                  |  296 -----
 backend/node_modules/string_decoder/package.json                                           |   34 -
 backend/node_modules/toidentifier/HISTORY.md                                               |    9 -
 backend/node_modules/toidentifier/LICENSE                                                  |   21 -
 backend/node_modules/toidentifier/README.md                                                |   61 -
 backend/node_modules/toidentifier/index.js                                                 |   32 -
 backend/node_modules/toidentifier/package.json                                             |   38 -
 backend/node_modules/type-is/HISTORY.md                                                    |  292 -----
 backend/node_modules/type-is/LICENSE                                                       |   23 -
 backend/node_modules/type-is/README.md                                                     |  198 ---
 backend/node_modules/type-is/index.js                                                      |  250 ----
 backend/node_modules/type-is/package.json                                                  |   47 -
 backend/node_modules/typedarray/.travis.yml                                                |    4 -
 backend/node_modules/typedarray/LICENSE                                                    |   35 -
 backend/node_modules/typedarray/example/tarray.js                                          |    4 -
 backend/node_modules/typedarray/index.js                                                   |  630 ----------
 backend/node_modules/typedarray/package.json                                               |   55 -
 backend/node_modules/typedarray/readme.markdown                                            |   61 -
 backend/node_modules/typedarray/test/server/undef_globals.js                               |   19 -
 backend/node_modules/typedarray/test/tarray.js                                             |   10 -
 backend/node_modules/unpipe/HISTORY.md                                                     |    4 -
 backend/node_modules/unpipe/LICENSE                                                        |   22 -
 backend/node_modules/unpipe/README.md                                                      |   43 -
 backend/node_modules/unpipe/index.js                                                       |   69 --
 backend/node_modules/unpipe/package.json                                                   |   27 -
 backend/node_modules/util-deprecate/History.md                                             |   16 -
 backend/node_modules/util-deprecate/LICENSE                                                |   24 -
 backend/node_modules/util-deprecate/README.md                                              |   53 -
 backend/node_modules/util-deprecate/browser.js                                             |   67 --
 backend/node_modules/util-deprecate/node.js                                                |    6 -
 backend/node_modules/util-deprecate/package.json                                           |   27 -
 backend/node_modules/vary/HISTORY.md                                                       |   39 -
 backend/node_modules/vary/LICENSE                                                          |   22 -
 backend/node_modules/vary/README.md                                                        |  101 --
 backend/node_modules/vary/index.js                                                         |  149 ---
 backend/node_modules/vary/package.json                                                     |   43 -
 backend/node_modules/wrappy/LICENSE                                                        |   15 -
 backend/node_modules/wrappy/README.md                                                      |   36 -
 backend/node_modules/wrappy/package.json                                                   |   29 -
 backend/node_modules/wrappy/wrappy.js                                                      |   33 -
 backend/node_modules/xtend/.jshintrc                                                       |   30 -
 backend/node_modules/xtend/LICENSE                                                         |   20 -
 backend/node_modules/xtend/README.md                                                       |   32 -
 backend/node_modules/xtend/immutable.js                                                    |   19 -
 backend/node_modules/xtend/mutable.js                                                      |   17 -
 backend/node_modules/xtend/package.json                                                    |   55 -
 backend/node_modules/xtend/test.js                                                         |  103 --
 797 files changed, 97764 deletions(-)

### fix: Validate data split ratios sum to 100% and remove implicit training
**Author:** darklorddad
**Date:** Fri Oct 17 18:22:44 2025 +0800



 core/gui.py             | 4 ++--
 core/process_dataset.py | 4 ----
 2 files changed, 2 insertions(+), 6 deletions(-)

### feat: Make data split directory names configurable
**Author:** darklorddad
**Date:** Fri Oct 17 17:47:34 2025 +0800



 core/finetune.py        | 36 +++++++++++++++++++++---------------
 core/gui.py             | 26 ++++++++++++++++++++++----
 core/process_dataset.py | 13 ++++++++-----
 3 files changed, 51 insertions(+), 24 deletions(-)

### build: Refine gitignore rule for core/dataset directories
**Author:** darklorddad
**Date:** Fri Oct 17 17:44:56 2025 +0800



 .gitignore | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### Merge branch 'main' of https://github.com/Uwe1209/SPS
**Author:** darklorddad
**Date:** Fri Oct 17 17:44:07 2025 +0800



### chore: Remove Google services config and relocate model document
**Author:** darklorddad
**Date:** Fri Oct 17 17:44:02 2025 +0800



 efficientvit_models.md => Documents/efficientvit_models.md |  0
 SmartPlant/google-services.json                            | 47 -----------------------------------------------
 2 files changed, 47 deletions(-)

### feat: Implement preliminary admin panel and update Firebase config
**Author:** darklorddad
**Date:** Fri Oct 17 17:36:56 2025 +0800



 .gitignore                                |    3 +-
 SmartPlant/eas.json                       |   21 ++
 SmartPlant/google-services.json           |   47 +++++
 SmartPlant/package-lock.json              | 2098 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++--------------------------------------------------------------------------------------------------------------------
 SmartPlant/src/admin/admin-preliminary.js |  680 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 SmartPlant/src/firebase/config.js         |   26 ---
 package-lock.json                         | 1265 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-
 7 files changed, 2826 insertions(+), 1314 deletions(-)

### feat: Make training progress logging frequency configurable
**Author:** darklorddad
**Date:** Fri Oct 17 17:29:22 2025 +0800



 core/finetune.py | 8 ++++++--
 core/gui.py      | 5 ++++-
 2 files changed, 10 insertions(+), 3 deletions(-)

### fix: Update TextInput multiline prop to numberOfLines
**Author:** darklorddad
**Date:** Fri Oct 17 17:28:49 2025 +0800



 SmartPlant/src/admin/screens/FeedbackDetailScreen.js | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### feat: Add temporary Admin Dashboard link to Profile screen
**Author:** darklorddad
**Date:** Fri Oct 17 17:25:38 2025 +0800



 SmartPlant/src/pages/Profile.js | 9 +++++++++
 1 file changed, 9 insertions(+)

### fix: Return dict on fine-tuning cancellation to prevent UI errors
**Author:** darklorddad
**Date:** Fri Oct 17 17:21:28 2025 +0800



 core/finetune.py | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### fix: Disable New Architecture and remove dev client for Expo Go
**Author:** darklorddad
**Date:** Fri Oct 17 17:19:12 2025 +0800



 SmartPlant/app.json     | 1 -
 SmartPlant/package.json | 1 -
 2 files changed, 2 deletions(-)

### fix: Report test accuracy in GUI summary
**Author:** darklorddad
**Date:** Fri Oct 17 17:17:07 2025 +0800



 core/finetune.py |  6 ++++--
 core/gui.py      | 10 ++++++++--
 2 files changed, 12 insertions(+), 4 deletions(-)

### refactor: Use Firebase web SDK for Expo Go compatibility
**Author:** darklorddad
**Date:** Fri Oct 17 17:13:31 2025 +0800



 SmartPlant/app.json                                        |  1 -
 SmartPlant/package.json                                    |  3 +--
 SmartPlant/src/firebase/FirebaseConfig.js                  |  4 +---
 SmartPlant/src/firebase/plant_identify/addPlantIdentify.js | 10 +++-------
 SmartPlant/src/pages/MapPage.js                            | 11 ++++++-----
 SmartPlant/src/pages/identify_output.js                    |  2 ++
 6 files changed, 13 insertions(+), 18 deletions(-)

### feat: Enable Android camera permissions and dev client
**Author:** darklorddad
**Date:** Fri Oct 17 17:13:25 2025 +0800



 SmartPlant/app.json     | 14 ++++++++++++--
 SmartPlant/package.json |  1 +
 2 files changed, 13 insertions(+), 2 deletions(-)

### fix: Ensure best model is saved with early stopping; remove unused import
**Author:** darklorddad
**Date:** Fri Oct 17 17:10:47 2025 +0800



 core/finetune.py | 9 ++++++++-
 1 file changed, 8 insertions(+), 1 deletion(-)

### refactor: Move 'Load truncated images' switch to fine-tuning tab
**Author:** darklorddad
**Date:** Fri Oct 17 17:07:53 2025 +0800



 core/gui.py | 48 ++++++++++++++++++++++++------------------------
 1 file changed, 24 insertions(+), 24 deletions(-)

### refactor: Move 'Strictly enforce model keys on load' switch to fine-tuning tab
**Author:** darklorddad
**Date:** Fri Oct 17 17:04:26 2025 +0800



 core/gui.py | 14 +++++++-------
 1 file changed, 7 insertions(+), 7 deletions(-)

### fix: Configure native Firebase and remove web SDK
**Author:** darklorddad
**Date:** Fri Oct 17 16:54:04 2025 +0800



 SmartPlant/app.json     | 1 +
 SmartPlant/package.json | 1 -
 2 files changed, 1 insertion(+), 1 deletion(-)

### feat: Add configurable fine-tune hyperparameters; remove UI test tab
**Author:** darklorddad
**Date:** Fri Oct 17 16:49:39 2025 +0800



 core/finetune.py |  12 ++++++++----
 core/gui.py      | 122 ++++++++++++++++----------------------------------------------------------------------------------------------------------
 2 files changed, 24 insertions(+), 110 deletions(-)

### fix: Add react-native-svg dependency to package.json
**Author:** darklorddad
**Date:** Fri Oct 17 16:48:28 2025 +0800



 SmartPlant/package.json | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)

### feat: Add label smoothing loss, test set eval and move GUI switch
**Author:** darklorddad
**Date:** Fri Oct 17 16:45:45 2025 +0800



 core/finetune.py | 41 ++++++++++++++++++++++++++++++++++++-----
 core/gui.py      |  1 +
 2 files changed, 37 insertions(+), 5 deletions(-)

### build: Add React Native Picker dependency
**Author:** darklorddad
**Date:** Fri Oct 17 16:44:28 2025 +0800



 SmartPlant/package.json | 1 +
 1 file changed, 1 insertion(+)

### feat: Add configurable finetuning and dataset processing options
**Author:** darklorddad
**Date:** Fri Oct 17 16:39:51 2025 +0800



 core/finetune.py        | 35 ++++++++++++++++++++++++++---------
 core/gui.py             | 73 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++----
 core/process_dataset.py | 27 ++++++++++++++++++++-------
 3 files changed, 115 insertions(+), 20 deletions(-)

### fix: Correct Firestore onSnapshot API usage in MapPage
**Author:** darklorddad
**Date:** Fri Oct 17 16:38:16 2025 +0800



 SmartPlant/src/pages/MapPage.js | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### fix: Add Firebase app and firestore dependencies
**Author:** darklorddad
**Date:** Fri Oct 17 16:34:40 2025 +0800



 package.json | 2 ++
 1 file changed, 2 insertions(+)

### fix: Fix Firestore imports and usage in MapPage
**Author:** darklorddad
**Date:** Fri Oct 17 16:29:55 2025 +0800



 SmartPlant/src/pages/MapPage.js | 9 ++++-----
 1 file changed, 4 insertions(+), 5 deletions(-)

### feat: Add optimiser and normalisation settings to GUI
**Author:** darklorddad
**Date:** Fri Oct 17 16:28:22 2025 +0800



 core/gui.py | 48 ++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 48 insertions(+)

### feat: Expose augmentation and data loader options; refactor GUI
**Author:** darklorddad
**Date:** Fri Oct 17 16:26:41 2025 +0800



 core/finetune.py | 20 +++++++++++++++++---
 core/gui.py      | 94 +++++++++++++++++++++++++++++++++++++++++++++-------------------------------------------------
 2 files changed, 62 insertions(+), 52 deletions(-)

### fix: Migrate Firestore imports and usage to React Native SDK
**Author:** darklorddad
**Date:** Fri Oct 17 16:25:34 2025 +0800



 SmartPlant/src/firebase/plant_identify/addPlantIdentify.js | 13 +++++++------
 SmartPlant/src/pages/identify_output.js                    |  2 --
 2 files changed, 7 insertions(+), 8 deletions(-)

### fix: Correct typos in optimizer and argument parser calls
**Author:** darklorddad
**Date:** Fri Oct 17 16:20:28 2025 +0800



 core/finetune.py | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### feat: Add configurable image processing and finetuning options
**Author:** darklorddad
**Date:** Fri Oct 17 16:06:54 2025 +0800



 core/finetune.py        |  64 +++++++++++++++++++++++++++++++++++++++++++++++++---------------
 core/gui.py             | 123 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-
 core/process_dataset.py |  19 +++++++++++++------
 3 files changed, 184 insertions(+), 22 deletions(-)

### feat: Add dependencies for picker, SVG, and web support
**Author:** darklorddad
**Date:** Fri Oct 17 15:30:29 2025 +0800



 package.json | 6 +++++-
 1 file changed, 5 insertions(+), 1 deletion(-)

### feat: Integrate admin dashboard into main navigation
**Author:** darklorddad
**Date:** Fri Oct 17 15:01:02 2025 +0800



 SmartPlant/App.js | 2 ++
 1 file changed, 2 insertions(+)

### feat: Dynamically display admin dashboard stats and implement mail deletion
**Author:** darklorddad
**Date:** Fri Oct 17 15:00:02 2025 +0800



 SmartPlant/src/admin/AdminContext.js             |  6 ++++++
 SmartPlant/src/admin/screens/DashboardScreen.js  | 17 +++++++++++------
 SmartPlant/src/admin/screens/MailDetailScreen.js |  9 ++++++++-
 3 files changed, 25 insertions(+), 7 deletions(-)

### refactor: Refactor feedback detail screen to use AdminContext
**Author:** darklorddad
**Date:** Fri Oct 17 14:58:00 2025 +0800



 SmartPlant/src/admin/screens/FeedbackDetailScreen.js | 17 ++++++++---------
 1 file changed, 8 insertions(+), 9 deletions(-)

### feat: Centralise admin state management and navigation
**Author:** darklorddad
**Date:** Fri Oct 17 14:57:26 2025 +0800



 SmartPlant/src/admin/AdminContext.js                     | 94 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 SmartPlant/src/admin/AdminNavigator.js                   | 70 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 SmartPlant/src/admin/screens/AccountManagementScreen.js  | 16 ++--------------
 SmartPlant/src/admin/screens/AddUserScreen.js            |  6 +++---
 SmartPlant/src/admin/screens/FeedbackManagementScreen.js |  9 ++-------
 SmartPlant/src/admin/screens/MailManagementScreen.js     | 16 +++-------------
 SmartPlant/src/admin/screens/UserProfileScreen.js        |  8 ++++++--
 7 files changed, 180 insertions(+), 39 deletions(-)

### feat: Create admin feedback management and detail screens
**Author:** darklorddad
**Date:** Fri Oct 17 14:54:17 2025 +0800



 SmartPlant/src/admin/screens/FeedbackDetailScreen.js     | 240 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 SmartPlant/src/admin/screens/FeedbackManagementScreen.js | 143 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 383 insertions(+)

### feat: Add Mail Management and Mail Detail screens
**Author:** darklorddad
**Date:** Fri Oct 17 14:51:33 2025 +0800



 SmartPlant/src/admin/screens/MailDetailScreen.js     | 129 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 SmartPlant/src/admin/screens/MailManagementScreen.js | 188 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 317 insertions(+)

### feat: Implement user profile and add user screens
**Author:** darklorddad
**Date:** Fri Oct 17 14:48:04 2025 +0800



 SmartPlant/src/admin/screens/AddUserScreen.js     | 197 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 SmartPlant/src/admin/screens/UserProfileScreen.js | 254 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 451 insertions(+)

### feat: Expose image size, workers, pretraining, and augmentation to GUI
**Author:** darklorddad
**Date:** Fri Oct 17 14:44:40 2025 +0800



 core/finetune.py | 31 ++++++++++++++++++++++---------
 core/gui.py      | 37 ++++++++++++++++++++++++++++++++++---
 2 files changed, 56 insertions(+), 12 deletions(-)

### feat: Implement React Native Dashboard and Account Management screens
**Author:** darklorddad
**Date:** Fri Oct 17 14:43:02 2025 +0800



 SmartPlant/src/admin/screens/AccountManagementScreen.js | 144 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 SmartPlant/src/admin/screens/DashboardScreen.js         | 196 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 340 insertions(+)

### feat: Add admin icons and SearchBar component for React Native
**Author:** darklorddad
**Date:** Fri Oct 17 14:38:57 2025 +0800



 SmartPlant/src/admin/Icons.js                | 70 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 SmartPlant/src/admin/components/SearchBar.js | 48 ++++++++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 118 insertions(+)

### feat: Add mixed precision training (AMP) support to fine-tuning
**Author:** darklorddad
**Date:** Fri Oct 17 14:33:03 2025 +0800



 core/finetune.py | 19 ++++++++++++++-----
 core/gui.py      | 10 ++++++++++
 2 files changed, 24 insertions(+), 5 deletions(-)

### feat: Log device usage during fine-tuning
**Author:** darklorddad
**Date:** Fri Oct 17 14:19:43 2025 +0800



 core/finetune.py | 1 +
 1 file changed, 1 insertion(+)

### feat: Add early stopping and expand optimiser dropdown
**Author:** darklorddad
**Date:** Fri Oct 17 13:33:01 2025 +0800



 core/finetune.py | 19 +++++++++++++++++++
 core/gui.py      | 22 ++++++++++++++++++++++
 2 files changed, 41 insertions(+)

### feat: Add dropout rate and optimiser selection to fine-tuning
**Author:** darklorddad
**Date:** Fri Oct 17 13:21:47 2025 +0800



 core/finetune.py | 16 ++++++++++++++--
 core/gui.py      | 18 ++++++++++++++++++
 2 files changed, 32 insertions(+), 2 deletions(-)

### feat: Enable all data augmentation by default
**Author:** darklorddad
**Date:** Fri Oct 17 13:08:42 2025 +0800



 core/finetune.py | 10 +++++-----
 core/gui.py      |  4 ++--
 2 files changed, 7 insertions(+), 7 deletions(-)

### feat: Support arbitrary timm/Hugging Face models for finetuning
**Author:** darklorddad
**Date:** Fri Oct 17 13:02:38 2025 +0800



 core/finetune.py | 35 +++++++----------------------------
 core/gui.py      | 23 +++++++----------------
 2 files changed, 14 insertions(+), 44 deletions(-)

### feat: Add granular data augmentation controls to fine-tuning
**Author:** darklorddad
**Date:** Fri Oct 17 12:49:24 2025 +0800



 core/finetune.py | 39 ++++++++++++++++++++++++++++++---------
 core/gui.py      | 45 +++++++++++++++++++++++++++++++++++++++------
 2 files changed, 69 insertions(+), 15 deletions(-)

### feat: Limit seed generation to 10 digits
**Author:** darklorddad
**Date:** Fri Oct 17 10:20:58 2025 +0800



 core/gui.py | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### fix: Move Data Augmentation card to fine-tuning tab
**Author:** darklorddad
**Date:** Fri Oct 17 09:59:56 2025 +0800



 core/gui.py | 80 ++++++++++++++++++++++++++++++++++++++++----------------------------------------
 1 file changed, 40 insertions(+), 40 deletions(-)

### refactor: Relocate data augmentation and seed to fine-tuning tab
**Author:** darklorddad
**Date:** Fri Oct 17 09:52:24 2025 +0800



 core/gui.py | 48 +++++++++++++++++++++++++++---------------------
 1 file changed, 27 insertions(+), 21 deletions(-)

### refactor: Move data augmentation toggle to dedicated card
**Author:** darklorddad
**Date:** Fri Oct 17 09:47:50 2025 +0800



 core/gui.py | 21 +++++++++++++++++++--
 1 file changed, 19 insertions(+), 2 deletions(-)

### feat: Remove default seed values and update labels in GUI
**Author:** darklorddad
**Date:** Fri Oct 17 09:45:04 2025 +0800



 core/gui.py | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### chore: Update default seed values in GUI
**Author:** darklorddad
**Date:** Fri Oct 17 09:43:45 2025 +0800



 core/gui.py | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### feat: Implement separate, generatable seeds for processing and fine-tuning
**Author:** darklorddad
**Date:** Fri Oct 17 09:40:05 2025 +0800



 core/gui.py | 62 ++++++++++++++++++++++++++++++++++++++++++++++++++++++--------
 1 file changed, 54 insertions(+), 8 deletions(-)

### feat: Allow toggling data augmentation and setting random seed
**Author:** darklorddad
**Date:** Fri Oct 17 09:30:12 2025 +0800



 core/finetune.py        | 20 +++++++++++++++++---
 core/gui.py             | 47 ++++++++++++++++++++++++++++++++++-------------
 core/process_dataset.py | 10 ++++++++--
 3 files changed, 59 insertions(+), 18 deletions(-)

### refactor: Refactor fine-tuning tab; remove config card, promote headings
**Author:** darklorddad
**Date:** Fri Oct 17 08:47:53 2025 +0800



 core/gui.py | 23 +++--------------------
 1 file changed, 3 insertions(+), 20 deletions(-)

### chore: Update GUI window title to 'Core'
**Author:** darklorddad
**Date:** Fri Oct 17 08:47:49 2025 +0800



 core/gui.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### style: Expand action buttons to full width
**Author:** darklorddad
**Date:** Fri Oct 17 08:41:01 2025 +0800



 core/gui.py | 2 ++
 1 file changed, 2 insertions(+)

### refactor: Group GUI sections into individual cards
**Author:** darklorddad
**Date:** Fri Oct 17 08:27:47 2025 +0800



 core/gui.py | 122 +++++++++++---------------------------------------------------------------------------------------------------------------
 1 file changed, 11 insertions(+), 111 deletions(-)

### refactor: Organise GUI sections into cards and align buttons in rows
**Author:** darklorddad
**Date:** Fri Oct 17 08:24:05 2025 +0800



 core/gui.py | 584 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++---------------------------------------------------------------------------------
 1 file changed, 371 insertions(+), 213 deletions(-)

### style: Standardise button and label text casing
**Author:** darklorddad
**Date:** Fri Oct 17 08:24:01 2025 +0800



 core/gui.py | 6 +++---
 1 file changed, 3 insertions(+), 3 deletions(-)

### fix: Remove redundant global toast_hide_timer declaration
**Author:** darklorddad
**Date:** Thu Oct 16 22:50:28 2025 +0800



 core/gui.py | 1 -
 1 file changed, 1 deletion(-)

### feat: Add resolution parameter to dataset processing
**Author:** darklorddad
**Date:** Thu Oct 16 22:48:03 2025 +0800



 core/gui.py | 4 ++++
 1 file changed, 4 insertions(+)

### feat: Add image resolution input and refine validation error toasts
**Author:** darklorddad
**Date:** Thu Oct 16 22:45:45 2025 +0800



 core/gui.py             | 12 +++++++++---
 core/process_dataset.py | 30 +++++++++++++++++++++++++-----
 2 files changed, 34 insertions(+), 8 deletions(-)

### style: Refine GUI text labels and window settings
**Author:** darklorddad
**Date:** Thu Oct 16 22:45:36 2025 +0800



 core/gui.py | 78 +++++++++++++++++++++++++++++++++++++++---------------------------------------
 1 file changed, 39 insertions(+), 39 deletions(-)

### fix: Reduce card spacing, shrink toast loading ring, and remove full stops
**Author:** darklorddad
**Date:** Thu Oct 16 22:21:41 2025 +0800



 core/finetune.py        | 30 +++++++++++++++---------------
 core/gui.py             | 60 ++++++++++++++++++++++++++++++------------------------------
 core/process_dataset.py | 66 +++++++++++++++++++++++++++++++++---------------------------------
 3 files changed, 78 insertions(+), 78 deletions(-)

### feat: Allow train, validation, test ratios; ensure total sum <= 100%
**Author:** darklorddad
**Date:** Thu Oct 16 22:03:45 2025 +0800



 core/gui.py             | 41 +++++++++++++++++++++++++++++++++--------
 core/process_dataset.py | 60 +++++++++++++++++++++++++++++++++++++++---------------------
 2 files changed, 72 insertions(+), 29 deletions(-)

### Fix: Streamline clear dataset and enhance toast feedback
**Author:** darklorddad
**Date:** Thu Oct 16 21:56:03 2025 +0800



 core/gui.py | 88 +++++++++++++++++++++++++---------------------------------------------------------------
 1 file changed, 25 insertions(+), 63 deletions(-)

### style: Adjust text field expand ratio to enlarge buttons
**Author:** darklorddad
**Date:** Thu Oct 16 21:39:42 2025 +0800



 core/gui.py | 10 +++++-----
 1 file changed, 5 insertions(+), 5 deletions(-)

### fix: Standardise button and text field sizing
**Author:** darklorddad
**Date:** Thu Oct 16 21:34:26 2025 +0800



 core/gui.py | 20 ++++++++++----------
 1 file changed, 10 insertions(+), 10 deletions(-)

### style: Standardise and make buttons beside text fields responsive
**Author:** darklorddad
**Date:** Thu Oct 16 21:30:09 2025 +0800



 core/gui.py | 11 +++++------
 1 file changed, 5 insertions(+), 6 deletions(-)

### style: Update UI colours for a darker, muted theme
**Author:** darklorddad
**Date:** Thu Oct 16 20:28:28 2025 +0800



 core/gui.py | 33 +++++++++++++++++----------------
 1 file changed, 17 insertions(+), 16 deletions(-)

### style: Darken button colours for midnight theme
**Author:** darklorddad
**Date:** Thu Oct 16 20:26:16 2025 +0800



 core/gui.py | 26 +++++++++++++-------------
 1 file changed, 13 insertions(+), 13 deletions(-)

### style: Apply dark theme and refine UI colours
**Author:** darklorddad
**Date:** Thu Oct 16 20:19:17 2025 +0800



 core/gui.py | 8 ++++----
 1 file changed, 4 insertions(+), 4 deletions(-)

### feat: generate markdown table for EfficientViT models
**Author:** darklorddad
**Date:** Thu Oct 16 19:43:21 2025 +0800



 efficientvit_models.md | 58 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 58 insertions(+)

### chore: Remove proposal, update .gitignore, and add reports
**Author:** darklorddad
**Date:** Thu Oct 16 19:37:15 2025 +0800



 .gitignore                                                                                   | 176 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-------
 Documents/COS30029-Complete-Project_Proposal.docx                                            | Bin 2211365 -> 0 bytes
 Documents/Discussion-reports/Optimal-Mobile-Vision-Model-for-Offline-Plant-Identification.md |  72 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 Environment_Set_up_06102025.pdf => Documents/Environment_Set_up_06102025.pdf                 | Bin
 Documents/Resources/Sprint-#1-Report-Submission/Sprint-#1-Report-Submission.pdf              | Bin 0 -> 113281 bytes
 Documents/pd224-03-1-rev1(F)-e.pdf                                                           | Bin 0 -> 15749977 bytes
 Images/WhatsApp-Image-2025-09-15-at-19.41.59_4636449b.jpg                                    | Bin 0 -> 35349 bytes
 Images/WhatsApp-Image-2025-09-15-at-19.41.59_89d972be.jpg                                    | Bin 0 -> 31276 bytes
 8 files changed, 240 insertions(+), 8 deletions(-)

### feat: Add UI Testing tab with toast notification examples
**Author:** darklorddad
**Date:** Thu Oct 16 08:08:13 2025 +0800



 core/gui.py | 89 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 89 insertions(+)

### feat: Add two-stage clear dataset confirmation with timeout and page click reset
**Author:** darklorddad
**Date:** Thu Oct 16 04:23:43 2025 +0800



 core/gui.py | 28 ++++++++++++++++++++--------
 1 file changed, 20 insertions(+), 8 deletions(-)

### feat: Enhance toast with auto-clear, inline spinner, and full-width button
**Author:** darklorddad
**Date:** Wed Oct 15 11:35:11 2025 +0800



 core/gui.py | 42 +++++++++++++++++++++++++++++++++++++-----
 1 file changed, 37 insertions(+), 5 deletions(-)

### fix: Prevent thread conflicts by renaming thread variables
**Author:** darklorddad
**Date:** Wed Oct 15 11:16:28 2025 +0800



 core/gui.py | 12 ++++++------
 1 file changed, 6 insertions(+), 6 deletions(-)

### refactor: Implement two-stage confirmation for clear dataset button
**Author:** darklorddad
**Date:** Wed Oct 15 11:09:55 2025 +0800



 core/gui.py | 58 +++++++++++++++++++++++++++-------------------------------
 1 file changed, 27 insertions(+), 31 deletions(-)

### fix: Display toast after dataset clear dialog dismissal
**Author:** darklorddad
**Date:** Wed Oct 15 11:05:56 2025 +0800



 core/gui.py | 79 ++++++++++++++++++++++++++++++++++++++++++++++---------------------------------
 1 file changed, 46 insertions(+), 33 deletions(-)

### fix: Display immediate feedback when clearing dataset
**Author:** darklorddad
**Date:** Wed Oct 15 11:03:29 2025 +0800



 core/gui.py | 11 ++++-------
 1 file changed, 4 insertions(+), 7 deletions(-)

### fix: Display toast message when clearing dataset
**Author:** darklorddad
**Date:** Wed Oct 15 11:01:51 2025 +0800



 core/gui.py | 11 +++++++----
 1 file changed, 7 insertions(+), 4 deletions(-)

### fix: Provide immediate feedback for dataset clearing
**Author:** darklorddad
**Date:** Wed Oct 15 10:58:52 2025 +0800



 core/gui.py | 43 +++++++++++++++++++++----------------------
 1 file changed, 21 insertions(+), 22 deletions(-)

### fix: Run dataset clearing in background thread to prevent UI freeze
**Author:** darklorddad
**Date:** Wed Oct 15 10:54:58 2025 +0800



 core/gui.py | 59 ++++++++++++++++++++++++++++++++---------------------------
 1 file changed, 32 insertions(+), 27 deletions(-)

### fix: Verify dataset directory deletion
**Author:** darklorddad
**Date:** Wed Oct 15 10:53:01 2025 +0800



 core/gui.py | 13 ++++++++++---
 1 file changed, 10 insertions(+), 3 deletions(-)

### fix: Assign clear dataset dialog to page during setup
**Author:** darklorddad
**Date:** Wed Oct 15 10:42:00 2025 +0800



 core/gui.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### fix: Persist selected paths and prevent accidental data deletion
**Author:** darklorddad
**Date:** Wed Oct 15 10:36:50 2025 +0800



 core/gui.py             |  5 +++++
 core/process_dataset.py | 18 ++++++++++--------
 2 files changed, 15 insertions(+), 8 deletions(-)

### feat: Add input persistence, cancellable operations, and clear dataset
**Author:** darklorddad
**Date:** Wed Oct 15 10:28:09 2025 +0800



 core/finetune.py        |   7 +++++++
 core/gui.py             | 133 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-----------
 core/process_dataset.py |  11 ++++++++++-
 3 files changed, 139 insertions(+), 12 deletions(-)

### feat: Add in-epoch progress reporting for fine-tuning
**Author:** darklorddad
**Date:** Wed Oct 15 10:20:47 2025 +0800



 core/finetune.py |  6 +++++-
 core/gui.py      | 16 ++++++++++------
 2 files changed, 15 insertions(+), 7 deletions(-)

### fix: Prevent toast from showing separator dashes
**Author:** darklorddad
**Date:** Wed Oct 15 10:11:21 2025 +0800



 core/gui.py | 3 +++
 1 file changed, 3 insertions(+)

### fix: Allow loading of truncated images to prevent errors
**Author:** darklorddad
**Date:** Wed Oct 15 10:09:17 2025 +0800



 core/finetune.py | 3 +++
 1 file changed, 3 insertions(+)

### Fix: Resolve tab and toast layout overlap
**Author:** darklorddad
**Date:** Wed Oct 15 10:07:56 2025 +0800



 core/gui.py | 7 +++----
 1 file changed, 3 insertions(+), 4 deletions(-)

### fix: Reintroduce container for tab content alignment
**Author:** darklorddad
**Date:** Wed Oct 15 10:04:44 2025 +0800



 core/gui.py | 18 ++++++++++++------
 1 file changed, 12 insertions(+), 6 deletions(-)

### fix: Remove extraneous closing parentheses from GUI tabs
**Author:** darklorddad
**Date:** Wed Oct 15 10:00:41 2025 +0800



 core/gui.py | 2 --
 1 file changed, 2 deletions(-)

### fix: Remove redundant container wrapping tab content
**Author:** darklorddad
**Date:** Wed Oct 15 09:59:11 2025 +0800



 core/gui.py | 16 ++++++----------
 1 file changed, 6 insertions(+), 10 deletions(-)

### fix: Remove redundant container causing tab content misalignment
**Author:** darklorddad
**Date:** Wed Oct 15 09:54:01 2025 +0800



 core/gui.py | 16 ++++++----------
 1 file changed, 6 insertions(+), 10 deletions(-)

### fix: Correct Flet colour attribute casing
**Author:** darklorddad
**Date:** Wed Oct 15 09:46:41 2025 +0800



 core/gui.py | 8 ++++----
 1 file changed, 4 insertions(+), 4 deletions(-)

### feat: Add MobileNetV2 and MobileNetV3-Large models
**Author:** darklorddad
**Date:** Wed Oct 15 09:45:56 2025 +0800



 core/finetune.py | 7 +++++++
 core/gui.py      | 2 ++
 2 files changed, 9 insertions(+)

### feat: Implement toast notifications for status updates with progress indicators
**Author:** darklorddad
**Date:** Wed Oct 15 09:44:15 2025 +0800



 core/gui.py | 72 ++++++++++++++++++++++++++++++++++++++++++++++--------------------------
 1 file changed, 46 insertions(+), 26 deletions(-)

### build: Ignore iNaturalist/Images/Dataset directory
**Author:** darklorddad
**Date:** Wed Oct 15 09:37:42 2025 +0800



 .gitignore | 1 +
 1 file changed, 1 insertion(+)

### fix: Improve dataset splitting for classes with few images
**Author:** darklorddad
**Date:** Wed Oct 15 09:31:07 2025 +0800



 core/process_dataset.py | 44 ++++++++++++++++++++++++++------------------
 1 file changed, 26 insertions(+), 18 deletions(-)

### Merge branch 'main' of https://github.com/Uwe1209/SPS
**Author:** darklorddad
**Date:** Wed Oct 15 09:07:09 2025 +0800



### fix: Standardise card spacing by adjusting container padding
**Author:** darklorddad
**Date:** Wed Oct 15 08:38:41 2025 +0800



 core/gui.py | 5 ++---
 1 file changed, 2 insertions(+), 3 deletions(-)

### style: Add vertical padding to final cards in tab views
**Author:** darklorddad
**Date:** Wed Oct 15 08:29:51 2025 +0800



 core/gui.py | 6 ++++--
 1 file changed, 4 insertions(+), 2 deletions(-)

### style: Increase text field and button heights
**Author:** darklorddad
**Date:** Wed Oct 15 08:29:47 2025 +0800



 core/gui.py | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### fix: Remove unsupported 'height' arg from Flet Dropdown
**Author:** darklorddad
**Date:** Wed Oct 15 08:22:04 2025 +0800



 core/gui.py | 1 -
 1 file changed, 1 deletion(-)

### style: Align dropdown height with text fields
**Author:** darklorddad
**Date:** Wed Oct 15 08:02:08 2025 +0800



 core/gui.py | 1 +
 1 file changed, 1 insertion(+)

### refactor: Stream training progress to single GUI output field
**Author:** darklorddad
**Date:** Wed Oct 15 08:01:18 2025 +0800



 core/finetune.py | 19 +++++++++++++------
 core/gui.py      | 22 +++++++++-------------
 2 files changed, 22 insertions(+), 19 deletions(-)

### fix: Update Flet Text widgets to use theme_style property
**Author:** darklorddad
**Date:** Wed Oct 15 07:34:57 2025 +0800



 core/gui.py | 14 +++++++-------
 1 file changed, 7 insertions(+), 7 deletions(-)

### style: Adjust whitespace for BUTTON_HEIGHT assignment
**Author:** darklorddad
**Date:** Wed Oct 15 07:34:55 2025 +0800



 core/gui.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### fix: Hide empty status text fields by default
**Author:** darklorddad
**Date:** Wed Oct 15 07:02:41 2025 +0800



 core/gui.py | 5 +++++
 1 file changed, 5 insertions(+)

### style: Adjust UI element heights
**Author:** darklorddad
**Date:** Wed Oct 15 07:02:37 2025 +0800



 core/gui.py | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### refactor: Decouple text field and button heights
**Author:** darklorddad
**Date:** Wed Oct 15 06:53:18 2025 +0800



 core/gui.py | 35 ++++++++++++++++++-----------------
 1 file changed, 18 insertions(+), 17 deletions(-)

### fix: Align fine-tuning configuration container padding
**Author:** darklorddad
**Date:** Wed Oct 15 06:50:44 2025 +0800



 core/gui.py | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)

### style: Add top padding to Fine-Tuning tab container
**Author:** darklorddad
**Date:** Wed Oct 15 06:41:12 2025 +0800



 core/gui.py | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)

### style: Add top padding to process dataset tab container
**Author:** darklorddad
**Date:** Wed Oct 15 06:34:32 2025 +0800



 core/gui.py | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)

### fix: Align scrollbar to right border by removing padding
**Author:** darklorddad
**Date:** Wed Oct 15 06:28:20 2025 +0800



 core/gui.py | 4 +---
 1 file changed, 1 insertion(+), 3 deletions(-)

### build: Add comprehensive Python .gitignore template
**Author:** darklorddad
**Date:** Wed Oct 15 06:18:05 2025 +0800



 .gitignore                                       | 223 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 core/__pycache__/finetune.cpython-312.pyc        | Bin 7604 -> 0 bytes
 core/__pycache__/process_dataset.cpython-312.pyc | Bin 5350 -> 0 bytes
 3 files changed, 223 insertions(+)

### feat: Add multiline text fields for status and result with 100px height
**Author:** darklorddad
**Date:** Wed Oct 15 05:29:55 2025 +0800



 core/gui.py | 16 ++++++++++++++--
 1 file changed, 14 insertions(+), 2 deletions(-)

### fix: Centre content cards within stretched scrollable columns
**Author:** darklorddad
**Date:** Wed Oct 15 05:18:52 2025 +0800



 core/gui.py | 335 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++----------------------------------------------------------------------------------------------------------
 1 file changed, 175 insertions(+), 160 deletions(-)

### style: Constrain content width and centre cards, keep scrollbar full-width
**Author:** darklorddad
**Date:** Wed Oct 15 05:05:14 2025 +0800



 core/gui.py | 23 ++++++++++++-----------
 1 file changed, 12 insertions(+), 11 deletions(-)

### style: Expand model dropdown to full width
**Author:** darklorddad
**Date:** Wed Oct 15 04:57:09 2025 +0800



 core/gui.py | 1 +
 1 file changed, 1 insertion(+)

### style: Stretch standalone buttons to full width
**Author:** darklorddad
**Date:** Wed Oct 15 04:50:40 2025 +0800



 core/gui.py | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### style: Reduce default widget height
**Author:** darklorddad
**Date:** Wed Oct 15 04:50:35 2025 +0800



 core/gui.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### feat: Standardise GUI widget heights to 60px
**Author:** darklorddad
**Date:** Wed Oct 15 04:41:03 2025 +0800



 core/gui.py | 9 ++++++++-
 1 file changed, 8 insertions(+), 1 deletion(-)

### fix: Fine-tune button vertical padding for alignment
**Author:** darklorddad
**Date:** Wed Oct 15 04:34:55 2025 +0800



 core/gui.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### style: Centre actions content on process dataset tab
**Author:** darklorddad
**Date:** Wed Oct 15 04:28:42 2025 +0800



 core/gui.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### fix: Centre GUI card content
**Author:** darklorddad
**Date:** Wed Oct 15 04:28:13 2025 +0800



 core/gui.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### fix: Standardise button height using padding and shared styles
**Author:** darklorddad
**Date:** Wed Oct 15 04:26:33 2025 +0800



 core/gui.py | 33 ++++++++++++++++++---------------
 1 file changed, 18 insertions(+), 15 deletions(-)

### fix: Correct button height to match text box
**Author:** darklorddad
**Date:** Wed Oct 15 04:22:30 2025 +0800



 core/gui.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### style: Standardise button widths in GUI
**Author:** darklorddad
**Date:** Wed Oct 15 04:16:52 2025 +0800



 core/gui.py | 6 ++++++
 1 file changed, 6 insertions(+)

### fix: Adjust button height for consistent visual alignment
**Author:** darklorddad
**Date:** Wed Oct 15 04:14:44 2025 +0800



 core/gui.py | 15 ++++++++-------
 1 file changed, 8 insertions(+), 7 deletions(-)

### refactor: Refactor GUI layout to place buttons beside text fields
**Author:** darklorddad
**Date:** Wed Oct 15 04:12:33 2025 +0800



 core/gui.py | 150 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++------------------------------------------------------------
 1 file changed, 90 insertions(+), 60 deletions(-)

### fix: Make card heights adapt to content
**Author:** darklorddad
**Date:** Wed Oct 15 04:02:19 2025 +0800



 core/gui.py | 2 ++
 1 file changed, 2 insertions(+)

### refactor: Standardise widget heights across GUI
**Author:** darklorddad
**Date:** Wed Oct 15 03:55:57 2025 +0800



 core/gui.py | 34 ++++++++++++++++++----------------
 1 file changed, 18 insertions(+), 16 deletions(-)

### fix: Correct button height argument for ft.ElevatedButton
**Author:** darklorddad
**Date:** Wed Oct 15 03:52:03 2025 +0800



 core/gui.py | 21 ++++++++++++++-------
 1 file changed, 14 insertions(+), 7 deletions(-)

### fix: Align button height with text fields
**Author:** darklorddad
**Date:** Wed Oct 15 03:50:24 2025 +0800



 core/gui.py | 14 +++++++-------
 1 file changed, 7 insertions(+), 7 deletions(-)

### feat: Stretch GUI controls to full width for improved layout
**Author:** darklorddad
**Date:** Wed Oct 15 02:34:39 2025 +0800



 core/gui.py | 140 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-------------------------------------------------------------------------------
 1 file changed, 61 insertions(+), 79 deletions(-)

### fix: Correct Flet color attribute to ft.Colors
**Author:** darklorddad
**Date:** Wed Oct 15 02:09:30 2025 +0800



 core/gui.py | 32 ++++++++++++++++----------------
 1 file changed, 16 insertions(+), 16 deletions(-)

### style: Refine GUI with modern buttons, dropdown, and remove main title
**Author:** darklorddad
**Date:** Wed Oct 15 02:05:35 2025 +0800



 core/gui.py | 47 +++++++++++++++++++++++++++++++++++++++--------
 1 file changed, 39 insertions(+), 8 deletions(-)

### fix: Correct `border_radius` argument to `radius` in `RoundedRectangleBorder`
**Author:** darklorddad
**Date:** Wed Oct 15 01:57:12 2025 +0800



 core/gui.py | 10 +++++-----
 1 file changed, 5 insertions(+), 5 deletions(-)

### feat: Overhaul GUI for a modern and user-friendly interface
**Author:** darklorddad
**Date:** Wed Oct 15 01:49:54 2025 +0800



 core/gui.py | 313 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-----------------------------------------------------------------------------------------------------------
 1 file changed, 162 insertions(+), 151 deletions(-)

### fix: Correct AttributeError by using ft.Icons in GUI
**Author:** darklorddad
**Date:** Wed Oct 15 01:29:58 2025 +0800



 core/gui.py | 14 +++++++-------
 1 file changed, 7 insertions(+), 7 deletions(-)

### feat: Improve GUI layout with cards, titles, and button icons
**Author:** darklorddad
**Date:** Wed Oct 15 01:26:13 2025 +0800



 core/gui.py | 231 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++------------------------------------------------------------------------
 1 file changed, 156 insertions(+), 75 deletions(-)

### refactor: Adjust GUI module import paths
**Author:** darklorddad
**Date:** Wed Oct 15 01:26:09 2025 +0800



 core/gui.py | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### refactor: Move backend modules to core and add iNaturalist dataset
**Author:** darklorddad
**Date:** Wed Oct 15 01:09:29 2025 +0800



 {backend/core => core}/__init__.py               |   0
 core/__pycache__/finetune.cpython-312.pyc        | Bin 0 -> 7604 bytes
 core/__pycache__/process_dataset.cpython-312.pyc | Bin 0 -> 5350 bytes
 {backend => core}/finetune.py                    |   0
 {backend => core}/gui.py                         |   0
 {backend => core}/process_dataset.py             |   0
 6 files changed, 0 insertions(+), 0 deletions(-)

### feat: Apply dark theme and improve tab layout and order
**Author:** darklorddad
**Date:** Wed Oct 15 01:03:13 2025 +0800



 backend/gui.py | 71 ++++++++++++++++++++++++++++++++++++++---------------------------------
 1 file changed, 38 insertions(+), 33 deletions(-)

### refactor: Move core backend logic to `core` subdirectory and update imports
**Author:** darklorddad
**Date:** Wed Oct 15 00:55:20 2025 +0800



 backend/core/__init__.py | 0
 backend/gui.py           | 4 ++--
 2 files changed, 2 insertions(+), 2 deletions(-)

### feat: Integrate dataset processing into GUI with threading
**Author:** darklorddad
**Date:** Wed Oct 15 00:25:17 2025 +0800



 backend/gui.py | 42 +++++++++++++++++++++++++++++++++++++++++-
 1 file changed, 41 insertions(+), 1 deletion(-)

### feat: Build 'Process Dataset' tab UI with directory pickers
**Author:** darklorddad
**Date:** Wed Oct 15 00:21:34 2025 +0800



 backend/gui.py | 51 +++++++++++++++++++++++++++++++++++++++++++++++++--
 1 file changed, 49 insertions(+), 2 deletions(-)

### refactor: implement tabbed GUI for fine-tuning and dataset
**Author:** darklorddad
**Date:** Wed Oct 15 00:17:32 2025 +0800



 backend/gui.py | 101 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-----------------------------------------
 1 file changed, 60 insertions(+), 41 deletions(-)

### fix: Correct finetune module import path
**Author:** darklorddad
**Date:** Wed Oct 15 00:17:27 2025 +0800



 backend/gui.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### feat: Add utility to split image datasets into train/val
**Author:** darklorddad
**Date:** Wed Oct 15 00:12:27 2025 +0800



 backend/process_dataset.py | 114 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 114 insertions(+)

### feat: Integrate fine-tuning backend with GUI
**Author:** darklorddad
**Date:** Tue Oct 14 23:25:24 2025 +0800



 backend/gui.py | 77 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++----------------
 1 file changed, 61 insertions(+), 16 deletions(-)

### feat: Add fine-tuning button, progress, and status displays
**Author:** darklorddad
**Date:** Tue Oct 14 23:21:48 2025 +0800



 backend/gui.py | 4 ++++
 1 file changed, 4 insertions(+)

### feat: Implement full fine-tuning and evaluation logic in `finetune.py`
**Author:** darklorddad
**Date:** Tue Oct 14 23:18:26 2025 +0800



 backend/finetune.py | 125 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++---
 1 file changed, 122 insertions(+), 3 deletions(-)

### feat: Add UI for model saving and loading
**Author:** darklorddad
**Date:** Tue Oct 14 23:14:28 2025 +0800



 backend/gui.py | 38 +++++++++++++++++++++++++++++++++++++-
 1 file changed, 37 insertions(+), 1 deletion(-)

### feat: Add input fields for epochs, batch size, and learning rate
**Author:** darklorddad
**Date:** Tue Oct 14 23:08:41 2025 +0800



 backend/gui.py | 3 +++
 1 file changed, 3 insertions(+)

### feat: Add dataset directory selection UI
**Author:** darklorddad
**Date:** Tue Oct 14 23:06:50 2025 +0800



 backend/gui.py | 24 +++++++++++++++++++++++-
 1 file changed, 23 insertions(+), 1 deletion(-)

### feat: Add model selection dropdown to GUI
**Author:** darklorddad
**Date:** Tue Oct 14 23:02:24 2025 +0800



 backend/gui.py | 11 +++++++++++
 1 file changed, 11 insertions(+)

### feat: Add basic Flet GUI structure for image finetuner
**Author:** darklorddad
**Date:** Tue Oct 14 22:57:48 2025 +0800



 backend/gui.py | 9 +++++++++
 1 file changed, 9 insertions(+)

### feat: Add initial fine-tuning script with argument parser
**Author:** darklorddad
**Date:** Tue Oct 14 22:50:03 2025 +0800



 backend/finetune.py | 24 ++++++++++++++++++++++++
 1 file changed, 24 insertions(+)

### Merge branch 'main' of https://github.com/Uwe1209/SPS
**Author:** darklorddad
**Date:** Mon Oct 13 15:25:48 2025 +0800



### Merge branch 'main' of https://github.com/Uwe1209/SPS
**Author:** darklorddad
**Date:** Mon Oct 13 15:25:48 2025 +0800



### fix: Add blank line after menu options
**Author:** darklorddad
**Date:** Mon Oct 13 12:09:51 2025 +0800



 iNaturalist/inaturalist_manager.py | 1 +
 1 file changed, 1 insertion(+)

### fix: Add blank line after menu options
**Author:** darklorddad
**Date:** Mon Oct 13 12:09:51 2025 +0800



 iNaturalist/inaturalist_manager.py | 1 +
 1 file changed, 1 insertion(+)

### feat: Add option to list downloaded species and categorise main menu
**Author:** darklorddad
**Date:** Mon Oct 13 12:06:07 2025 +0800



 iNaturalist/inaturalist_manager.py | 73 +++++++++++++++++++++++++++++++++++++++++++++++++++++--------------------
 1 file changed, 53 insertions(+), 20 deletions(-)

### feat: Add option to list downloaded species and categorise main menu
**Author:** darklorddad
**Date:** Mon Oct 13 12:06:07 2025 +0800



 iNaturalist/inaturalist_manager.py | 73 +++++++++++++++++++++++++++++++++++++++++++++++++++++--------------------
 1 file changed, 53 insertions(+), 20 deletions(-)

### Merge branch 'main' of https://github.com/Uwe1209/SPS
**Author:** darklorddad
**Date:** Fri Oct 10 09:15:25 2025 +0800



### Merge branch 'main' of https://github.com/Uwe1209/SPS
**Author:** darklorddad
**Date:** Fri Oct 10 09:15:25 2025 +0800



### feat: Categorise downloaded images by species
**Author:** darklorddad
**Date:** Thu Oct 9 14:13:08 2025 +0800



 iNaturalist/inaturalist_manager.py | 13 ++++++++++---
 1 file changed, 10 insertions(+), 3 deletions(-)

### feat: Categorise downloaded images by species
**Author:** darklorddad
**Date:** Thu Oct 9 14:13:08 2025 +0800



 iNaturalist/inaturalist_manager.py | 13 ++++++++++---
 1 file changed, 10 insertions(+), 3 deletions(-)

### feat: Add options for image download, update, and verification
**Author:** darklorddad
**Date:** Thu Oct 9 13:59:35 2025 +0800



 iNaturalist/inaturalist_manager.py | 174 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++--
 1 file changed, 172 insertions(+), 2 deletions(-)

### feat: Add options for image download, update, and verification
**Author:** darklorddad
**Date:** Thu Oct 9 13:59:35 2025 +0800



 iNaturalist/inaturalist_manager.py | 174 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++--
 1 file changed, 172 insertions(+), 2 deletions(-)

### Merge branch 'main' of https://github.com/Uwe1209/SPS
**Author:** darklorddad
**Date:** Thu Oct 9 11:24:03 2025 +0800



### Merge branch 'main' of https://github.com/Uwe1209/SPS
**Author:** darklorddad
**Date:** Thu Oct 9 11:24:03 2025 +0800



### fix: Improve count mismatch detection; delete local files for 0 remote obs
**Author:** darklorddad
**Date:** Thu Oct 9 11:06:21 2025 +0800



 iNaturalist/inaturalist_manager.py | 19 ++++++++++++++++---
 1 file changed, 16 insertions(+), 3 deletions(-)

### fix: Improve count mismatch detection; delete local files for 0 remote obs
**Author:** darklorddad
**Date:** Thu Oct 9 11:06:21 2025 +0800



 iNaturalist/inaturalist_manager.py | 19 ++++++++++++++++---
 1 file changed, 16 insertions(+), 3 deletions(-)

### fix: Correctly count CSV rows in `get_local_count` to handle multi-line fields
**Author:** darklorddad
**Date:** Thu Oct 9 10:47:52 2025 +0800



 iNaturalist/inaturalist_manager.py | 14 +++++++++-----
 1 file changed, 9 insertions(+), 5 deletions(-)

### fix: Correctly count CSV rows in `get_local_count` to handle multi-line fields
**Author:** darklorddad
**Date:** Thu Oct 9 10:47:52 2025 +0800



 iNaturalist/inaturalist_manager.py | 14 +++++++++-----
 1 file changed, 9 insertions(+), 5 deletions(-)

### fix: Remove duplicate headers from paginated iNaturalist CSVs
**Author:** darklorddad
**Date:** Thu Oct 9 10:26:43 2025 +0800



 iNaturalist/inaturalist_manager.py | 24 +++++++++++++++++++++---
 1 file changed, 21 insertions(+), 3 deletions(-)

### fix: Remove duplicate headers from paginated iNaturalist CSVs
**Author:** darklorddad
**Date:** Thu Oct 9 10:26:43 2025 +0800



 iNaturalist/inaturalist_manager.py | 24 +++++++++++++++++++++---
 1 file changed, 21 insertions(+), 3 deletions(-)

### feat: Restrict iNaturalist data fetching to Malaysia
**Author:** darklorddad
**Date:** Thu Oct 9 10:03:45 2025 +0800



 iNaturalist/inaturalist_manager.py | 2 ++
 1 file changed, 2 insertions(+)

### feat: Restrict iNaturalist data fetching to Malaysia
**Author:** darklorddad
**Date:** Thu Oct 9 10:03:45 2025 +0800



 iNaturalist/inaturalist_manager.py | 2 ++
 1 file changed, 2 insertions(+)

### fix: Use page-based pagination for iNaturalist CSV downloads
**Author:** darklorddad
**Date:** Thu Oct 9 08:58:01 2025 +0800



 iNaturalist/inaturalist_manager.py | 7 +++----
 1 file changed, 3 insertions(+), 4 deletions(-)

### fix: Use page-based pagination for iNaturalist CSV downloads
**Author:** darklorddad
**Date:** Thu Oct 9 08:58:01 2025 +0800



 iNaturalist/inaturalist_manager.py | 7 +++----
 1 file changed, 3 insertions(+), 4 deletions(-)

### fix: Correct CSV parsing for paginated results
**Author:** darklorddad
**Date:** Thu Oct 9 07:37:42 2025 +0800



 iNaturalist/inaturalist_manager.py | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### fix: Correct CSV parsing for paginated results
**Author:** darklorddad
**Date:** Thu Oct 9 07:37:42 2025 +0800



 iNaturalist/inaturalist_manager.py | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### fix: Fix incomplete iNaturalist observation downloads
**Author:** darklorddad
**Date:** Thu Oct 9 07:20:05 2025 +0800



 iNaturalist/inaturalist_manager.py | 127 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++----------------------------------------------------------------------
 1 file changed, 57 insertions(+), 70 deletions(-)

### fix: Fix incomplete iNaturalist observation downloads
**Author:** darklorddad
**Date:** Thu Oct 9 07:20:05 2025 +0800



 iNaturalist/inaturalist_manager.py | 127 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++----------------------------------------------------------------------
 1 file changed, 57 insertions(+), 70 deletions(-)

### feat: Implement year-by-year download and adhere to API limits
**Author:** darklorddad
**Date:** Thu Oct 9 06:51:21 2025 +0800



 iNaturalist/inaturalist_manager.py | 146 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++------------------------------------------------------------------------
 1 file changed, 74 insertions(+), 72 deletions(-)

### feat: Implement year-by-year download and adhere to API limits
**Author:** darklorddad
**Date:** Thu Oct 9 06:51:21 2025 +0800



 iNaturalist/inaturalist_manager.py | 146 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++------------------------------------------------------------------------
 1 file changed, 74 insertions(+), 72 deletions(-)

### perf: Increase iNaturalist API request rate limit for faster downloads
**Author:** darklorddad
**Date:** Thu Oct 9 06:47:10 2025 +0800



 iNaturalist/inaturalist_manager.py | 10 +++++-----
 1 file changed, 5 insertions(+), 5 deletions(-)

### perf: Increase iNaturalist API request rate limit for faster downloads
**Author:** darklorddad
**Date:** Thu Oct 9 06:47:10 2025 +0800



 iNaturalist/inaturalist_manager.py | 10 +++++-----
 1 file changed, 5 insertions(+), 5 deletions(-)

### feat: Add last updated timestamp to cache and display
**Author:** darklorddad
**Date:** Thu Oct 9 06:44:57 2025 +0800



 iNaturalist/inaturalist_manager.py | 40 ++++++++++++++++++++++++++++++----------
 1 file changed, 30 insertions(+), 10 deletions(-)

### feat: Add last updated timestamp to cache and display
**Author:** darklorddad
**Date:** Thu Oct 9 06:44:57 2025 +0800



 iNaturalist/inaturalist_manager.py | 40 ++++++++++++++++++++++++++++++----------
 1 file changed, 30 insertions(+), 10 deletions(-)

### chore: Remove parse-manifest.py and rename unzip script
**Author:** darklorddad
**Date:** Thu Oct 9 06:36:29 2025 +0800



 iNaturalist/parse-manifest.py                  | 341 -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 iNaturalist/{Unzip-Ficus.py => unzip_ficus.py} |   0
 2 files changed, 341 deletions(-)

### chore: Remove parse-manifest.py and rename unzip script
**Author:** darklorddad
**Date:** Thu Oct 9 06:36:29 2025 +0800



 iNaturalist/parse-manifest.py                  | 341 -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 iNaturalist/{Unzip-Ficus.py => unzip_ficus.py} |   0
 2 files changed, 341 deletions(-)

### fix: Correct CSV parsing for accurate download progress
**Author:** darklorddad
**Date:** Thu Oct 9 05:30:29 2025 +0800



 iNaturalist/inaturalist_manager.py | 34 +++++++++++++++++++++++-----------
 1 file changed, 23 insertions(+), 11 deletions(-)

### fix: Correct CSV parsing for accurate download progress
**Author:** darklorddad
**Date:** Thu Oct 9 05:30:29 2025 +0800



 iNaturalist/inaturalist_manager.py | 34 +++++++++++++++++++++++-----------
 1 file changed, 23 insertions(+), 11 deletions(-)

### fix: Increase iNaturalist API sleep to 4.8s to prevent rate limiting
**Author:** darklorddad
**Date:** Thu Oct 9 05:13:15 2025 +0800



 iNaturalist/inaturalist_manager.py | 10 +++++-----
 1 file changed, 5 insertions(+), 5 deletions(-)

### fix: Increase iNaturalist API sleep to 4.8s to prevent rate limiting
**Author:** darklorddad
**Date:** Thu Oct 9 05:13:15 2025 +0800



 iNaturalist/inaturalist_manager.py | 10 +++++-----
 1 file changed, 5 insertions(+), 5 deletions(-)

### fix: Adjust iNaturalist API rate limit delay for safety margin
**Author:** darklorddad
**Date:** Thu Oct 9 04:59:32 2025 +0800



 iNaturalist/inaturalist_manager.py | 10 +++++-----
 1 file changed, 5 insertions(+), 5 deletions(-)

### fix: Adjust iNaturalist API rate limit delay for safety margin
**Author:** darklorddad
**Date:** Thu Oct 9 04:59:32 2025 +0800



 iNaturalist/inaturalist_manager.py | 10 +++++-----
 1 file changed, 5 insertions(+), 5 deletions(-)

### perf: Increase concurrent workers and adjust API rate limit delays
**Author:** darklorddad
**Date:** Thu Oct 9 04:48:06 2025 +0800



 iNaturalist/inaturalist_manager.py | 16 ++++++++--------
 1 file changed, 8 insertions(+), 8 deletions(-)

### perf: Increase concurrent workers and adjust API rate limit delays
**Author:** darklorddad
**Date:** Thu Oct 9 04:48:06 2025 +0800



 iNaturalist/inaturalist_manager.py | 16 ++++++++--------
 1 file changed, 8 insertions(+), 8 deletions(-)

### fix: Implement retry mechanism for iNaturalist API timeouts
**Author:** darklorddad
**Date:** Thu Oct 9 04:22:45 2025 +0800



 iNaturalist/inaturalist_manager.py | 37 +++++++++++++++++++++++++------------
 1 file changed, 25 insertions(+), 12 deletions(-)

### fix: Implement retry mechanism for iNaturalist API timeouts
**Author:** darklorddad
**Date:** Thu Oct 9 04:22:45 2025 +0800



 iNaturalist/inaturalist_manager.py | 37 +++++++++++++++++++++++++------------
 1 file changed, 25 insertions(+), 12 deletions(-)

### fix: Adjust API call parameters and error handling for observation counts
**Author:** darklorddad
**Date:** Thu Oct 9 04:12:46 2025 +0800



 iNaturalist/inaturalist_manager.py | 9 ++++++---
 1 file changed, 6 insertions(+), 3 deletions(-)

### fix: Adjust API call parameters and error handling for observation counts
**Author:** darklorddad
**Date:** Thu Oct 9 04:12:46 2025 +0800



 iNaturalist/inaturalist_manager.py | 9 ++++++---
 1 file changed, 6 insertions(+), 3 deletions(-)

### feat: Introduce concurrent taxon processing and improve API rate limits
**Author:** darklorddad
**Date:** Thu Oct 9 04:00:52 2025 +0800



 iNaturalist/inaturalist_manager.py | 97 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-------------------------
 1 file changed, 72 insertions(+), 25 deletions(-)

### feat: Introduce concurrent taxon processing and improve API rate limits
**Author:** darklorddad
**Date:** Thu Oct 9 04:00:52 2025 +0800



 iNaturalist/inaturalist_manager.py | 97 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-------------------------
 1 file changed, 72 insertions(+), 25 deletions(-)

### fix: Fix 'no counts loaded' warning, add API rate limiting, and compare with cached counts
**Author:** darklorddad
**Date:** Thu Oct 9 03:43:40 2025 +0800



 iNaturalist/inaturalist_manager.py | 35 ++++++++++++++++++++++++++---------
 1 file changed, 26 insertions(+), 9 deletions(-)

### fix: Fix 'no counts loaded' warning, add API rate limiting, and compare with cached counts
**Author:** darklorddad
**Date:** Thu Oct 9 03:43:40 2025 +0800



 iNaturalist/inaturalist_manager.py | 35 ++++++++++++++++++++++++++---------
 1 file changed, 26 insertions(+), 9 deletions(-)

### fix: Correct iNaturalist CSV download URL
**Author:** darklorddad
**Date:** Thu Oct 9 03:29:16 2025 +0800



 iNaturalist/inaturalist_manager.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### fix: Correct iNaturalist CSV download URL
**Author:** darklorddad
**Date:** Thu Oct 9 03:29:16 2025 +0800



 iNaturalist/inaturalist_manager.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### feat: Implement iNaturalist data download, update, and comparison
**Author:** darklorddad
**Date:** Thu Oct 9 02:31:38 2025 +0800



 iNaturalist/inaturalist_manager.py | 256 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++--------------
 1 file changed, 239 insertions(+), 17 deletions(-)

### feat: Implement iNaturalist data download, update, and comparison
**Author:** darklorddad
**Date:** Thu Oct 9 02:31:38 2025 +0800



 iNaturalist/inaturalist_manager.py | 256 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++--------------
 1 file changed, 239 insertions(+), 17 deletions(-)

### feat: Implement iNaturalist data manager script
**Author:** darklorddad
**Date:** Thu Oct 9 02:31:31 2025 +0800



 iNaturalist/inaturalist_manager.py | 341 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 341 insertions(+)

### feat: Implement iNaturalist data manager script
**Author:** darklorddad
**Date:** Thu Oct 9 02:31:31 2025 +0800



 iNaturalist/inaturalist_manager.py | 341 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 341 insertions(+)

### docs: Add counts and refine iNaturalist manifest; rename parsing script
**Author:** darklorddad
**Date:** Thu Oct 9 02:02:11 2025 +0800



 .gitignore                                           |  2 +-
 iNaturalist/iNaturalist-manifest.md                  | 59 ++++++++++++++++++++++++++++++++++++++++++++++++++---------
 iNaturalist/{parse_manifest.py => parse-manifest.py} |  0
 3 files changed, 51 insertions(+), 10 deletions(-)

### docs: Add counts and refine iNaturalist manifest; rename parsing script
**Author:** darklorddad
**Date:** Thu Oct 9 02:02:11 2025 +0800



 .gitignore                                           |  2 +-
 iNaturalist/iNaturalist-manifest.md                  | 59 ++++++++++++++++++++++++++++++++++++++++++++++++++---------
 iNaturalist/{parse_manifest.py => parse-manifest.py} |  0
 3 files changed, 51 insertions(+), 10 deletions(-)

### feat: Add observation count caching and interactive menu
**Author:** darklorddad
**Date:** Thu Oct 9 01:59:13 2025 +0800



 iNaturalist/parse_manifest.py | 93 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++------
 1 file changed, 87 insertions(+), 6 deletions(-)

### feat: Add observation count caching and interactive menu
**Author:** darklorddad
**Date:** Thu Oct 9 01:59:13 2025 +0800



 iNaturalist/parse_manifest.py | 93 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++------
 1 file changed, 87 insertions(+), 6 deletions(-)

### refactor: Handle numbered headings for cleaner tree display
**Author:** darklorddad
**Date:** Thu Oct 9 01:39:16 2025 +0800



 iNaturalist/parse_manifest.py | 26 +++++++++++++++++++++-----
 1 file changed, 21 insertions(+), 5 deletions(-)

### refactor: Handle numbered headings for cleaner tree display
**Author:** darklorddad
**Date:** Thu Oct 9 01:39:16 2025 +0800



 iNaturalist/parse_manifest.py | 26 +++++++++++++++++++++-----
 1 file changed, 21 insertions(+), 5 deletions(-)

### fix: Preserve leading numbers in slugified headings for correct parsing
**Author:** darklorddad
**Date:** Thu Oct 9 01:35:17 2025 +0800



 iNaturalist/parse_manifest.py | 8 +++-----
 1 file changed, 3 insertions(+), 5 deletions(-)

### fix: Preserve leading numbers in slugified headings for correct parsing
**Author:** darklorddad
**Date:** Thu Oct 9 01:35:17 2025 +0800



 iNaturalist/parse_manifest.py | 8 +++-----
 1 file changed, 3 insertions(+), 5 deletions(-)

### fix: Correct manifest parsing to ignore taxons under invalid headings
**Author:** darklorddad
**Date:** Thu Oct 9 01:18:17 2025 +0800



 iNaturalist/parse_manifest.py | 19 +++++++++++++++----
 1 file changed, 15 insertions(+), 4 deletions(-)

### fix: Correct manifest parsing to ignore taxons under invalid headings
**Author:** darklorddad
**Date:** Thu Oct 9 01:18:17 2025 +0800



 iNaturalist/parse_manifest.py | 19 +++++++++++++++----
 1 file changed, 15 insertions(+), 4 deletions(-)

### feat: Prune empty directories and display taxon counts in tree output
**Author:** darklorddad
**Date:** Thu Oct 9 01:09:25 2025 +0800



 iNaturalist/parse_manifest.py | 37 ++++++++++++++++++++++++++++++++++++-
 1 file changed, 36 insertions(+), 1 deletion(-)

### feat: Prune empty directories and display taxon counts in tree output
**Author:** darklorddad
**Date:** Thu Oct 9 01:09:25 2025 +0800



 iNaturalist/parse_manifest.py | 37 ++++++++++++++++++++++++++++++++++++-
 1 file changed, 36 insertions(+), 1 deletion(-)

### feat: Fetch iNaturalist observations for all years
**Author:** darklorddad
**Date:** Thu Oct 9 00:56:51 2025 +0800



 iNaturalist/parse_manifest.py | 2 --
 1 file changed, 2 deletions(-)

### feat: Fetch iNaturalist observations for all years
**Author:** darklorddad
**Date:** Thu Oct 9 00:56:51 2025 +0800



 iNaturalist/parse_manifest.py | 2 --
 1 file changed, 2 deletions(-)

### feat: Fetch and display iNaturalist taxon observation counts
**Author:** darklorddad
**Date:** Thu Oct 9 00:53:58 2025 +0800



 iNaturalist/parse_manifest.py | 50 +++++++++++++++++++++++++++++++++++++++++++++-----
 1 file changed, 45 insertions(+), 5 deletions(-)

### feat: Fetch and display iNaturalist taxon observation counts
**Author:** darklorddad
**Date:** Thu Oct 9 00:53:58 2025 +0800



 iNaturalist/parse_manifest.py | 50 +++++++++++++++++++++++++++++++++++++++++++++-----
 1 file changed, 45 insertions(+), 5 deletions(-)

### feat: Exclude 'Not found' headings when parsing iNaturalist manifest
**Author:** darklorddad
**Date:** Thu Oct 9 00:47:26 2025 +0800



 iNaturalist/parse_manifest.py | 93 ++++++++++++++++++++++++++++++++++++++++++++++++---------------------------------------------
 1 file changed, 48 insertions(+), 45 deletions(-)

### feat: Exclude 'Not found' headings when parsing iNaturalist manifest
**Author:** darklorddad
**Date:** Thu Oct 9 00:47:26 2025 +0800



 iNaturalist/parse_manifest.py | 93 ++++++++++++++++++++++++++++++++++++++++++++++++---------------------------------------------
 1 file changed, 48 insertions(+), 45 deletions(-)

### feat: Improve taxon ID detection and generate descriptive taxon filenames
**Author:** darklorddad
**Date:** Thu Oct 9 00:41:43 2025 +0800



 iNaturalist/parse_manifest.py | 36 +++++++++++++++++++++++++++++-------
 1 file changed, 29 insertions(+), 7 deletions(-)

### feat: Improve taxon ID detection and generate descriptive taxon filenames
**Author:** darklorddad
**Date:** Thu Oct 9 00:41:43 2025 +0800



 iNaturalist/parse_manifest.py | 36 +++++++++++++++++++++++++++++-------
 1 file changed, 29 insertions(+), 7 deletions(-)

### feat: Add script to parse manifest and display taxon hierarchy
**Author:** darklorddad
**Date:** Thu Oct 9 00:38:56 2025 +0800



 iNaturalist/parse_manifest.py | 137 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 137 insertions(+)

### feat: Add script to parse manifest and display taxon hierarchy
**Author:** darklorddad
**Date:** Thu Oct 9 00:38:56 2025 +0800



 iNaturalist/parse_manifest.py | 137 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 137 insertions(+)

### chore: Remove iNaturalist data export and image download scripts
**Author:** darklorddad
**Date:** Thu Oct 9 00:11:44 2025 +0800



 .gitignore                              |    3 +-
 iNaturalist/Download-images-from-CSV.py |  125 -------------
 iNaturalist/Image-download-checksum.txt | 1928 -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 iNaturalist/iNaturalist-exporter.py     |  299 ------------------------------
 4 files changed, 2 insertions(+), 2353 deletions(-)

### chore: Remove iNaturalist data export and image download scripts
**Author:** darklorddad
**Date:** Thu Oct 9 00:11:44 2025 +0800



 .gitignore                              |    3 +-
 iNaturalist/Download-images-from-CSV.py |  125 -------------
 iNaturalist/Image-download-checksum.txt | 1928 -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 iNaturalist/iNaturalist-exporter.py     |  299 ------------------------------
 4 files changed, 2 insertions(+), 2353 deletions(-)

### fix: Mitigate iNaturalist API throttling with retries and lower concurrency
**Author:** darklorddad
**Date:** Wed Oct 8 09:12:30 2025 +0800



 iNaturalist/iNaturalist-exporter.py | 71 ++++++++++++++++++++++++++++++++++++++++++++++-------------------------
 1 file changed, 46 insertions(+), 25 deletions(-)

### fix: Mitigate iNaturalist API throttling with retries and lower concurrency
**Author:** darklorddad
**Date:** Wed Oct 8 09:12:30 2025 +0800



 iNaturalist/iNaturalist-exporter.py | 71 ++++++++++++++++++++++++++++++++++++++++++++++-------------------------
 1 file changed, 46 insertions(+), 25 deletions(-)

### feat: Add interactive menu for export options and observation counts
**Author:** darklorddad
**Date:** Wed Oct 8 08:55:58 2025 +0800



 iNaturalist/iNaturalist-exporter.py | 103 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++--------------------
 1 file changed, 83 insertions(+), 20 deletions(-)

### feat: Add interactive menu for export options and observation counts
**Author:** darklorddad
**Date:** Wed Oct 8 08:55:58 2025 +0800



 iNaturalist/iNaturalist-exporter.py | 103 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++--------------------
 1 file changed, 83 insertions(+), 20 deletions(-)

### fix: Align taxon observation count with verifiable downloads
**Author:** darklorddad
**Date:** Tue Oct 7 10:18:50 2025 +0800



 iNaturalist/iNaturalist-exporter.py | 33 ++++++++++++++++++++++-----------
 1 file changed, 22 insertions(+), 11 deletions(-)

### fix: Align taxon observation count with verifiable downloads
**Author:** darklorddad
**Date:** Tue Oct 7 10:18:50 2025 +0800



 iNaturalist/iNaturalist-exporter.py | 33 ++++++++++++++++++++++-----------
 1 file changed, 22 insertions(+), 11 deletions(-)

### chore: Update exporter input file to manifest
**Author:** darklorddad
**Date:** Tue Oct 7 07:58:04 2025 +0800



 iNaturalist/iNaturalist-exporter.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### chore: Update exporter input file to manifest
**Author:** darklorddad
**Date:** Tue Oct 7 07:58:04 2025 +0800



 iNaturalist/iNaturalist-exporter.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### feat: Implement nested directory structure, tree display with observation counts
**Author:** darklorddad
**Date:** Tue Oct 7 07:56:50 2025 +0800



 iNaturalist/iNaturalist-exporter.py | 123 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++--------------------------
 1 file changed, 97 insertions(+), 26 deletions(-)

### feat: Implement nested directory structure, tree display with observation counts
**Author:** darklorddad
**Date:** Tue Oct 7 07:56:50 2025 +0800



 iNaturalist/iNaturalist-exporter.py | 123 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++--------------------------
 1 file changed, 97 insertions(+), 26 deletions(-)

### refactor: Rename iNaturalist notes file to manifest
**Author:** darklorddad
**Date:** Tue Oct 7 07:55:06 2025 +0800



 iNaturalist/{iNaturalist-notes.md => iNaturalist-manifest.md} | 0
 1 file changed, 0 insertions(+), 0 deletions(-)

### refactor: Rename iNaturalist notes file to manifest
**Author:** darklorddad
**Date:** Tue Oct 7 07:55:06 2025 +0800



 iNaturalist/{iNaturalist-notes.md => iNaturalist-manifest.md} | 0
 1 file changed, 0 insertions(+), 0 deletions(-)

### feat: Consolidate species data to single CSV; overwrite, add API retries
**Author:** darklorddad
**Date:** Tue Oct 7 07:30:50 2025 +0800



 iNaturalist/iNaturalist-exporter.py | 100 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++------------------------------------------
 1 file changed, 58 insertions(+), 42 deletions(-)

### feat: Consolidate species data to single CSV; overwrite, add API retries
**Author:** darklorddad
**Date:** Tue Oct 7 07:30:50 2025 +0800



 iNaturalist/iNaturalist-exporter.py | 100 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++------------------------------------------
 1 file changed, 58 insertions(+), 42 deletions(-)

### refactor: Speed up downloads with concurrency; use dashes in folder names
**Author:** darklorddad
**Date:** Tue Oct 7 07:24:12 2025 +0800



 iNaturalist/iNaturalist-exporter.py | 106 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++---------------------------------------------
 1 file changed, 61 insertions(+), 45 deletions(-)

### refactor: Speed up downloads with concurrency; use dashes in folder names
**Author:** darklorddad
**Date:** Tue Oct 7 07:24:12 2025 +0800



 iNaturalist/iNaturalist-exporter.py | 106 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++---------------------------------------------
 1 file changed, 61 insertions(+), 45 deletions(-)

### refactor: Relocate iNaturalist scripts to dedicated folder
**Author:** darklorddad
**Date:** Tue Oct 7 07:21:01 2025 +0800



 download_images_from_csv.py => iNaturalist/Download-images-from-CSV.py | 0
 image_download_checksum.txt => iNaturalist/Image-download-checksum.txt | 0
 unzip_ficus.py => iNaturalist/Unzip-Ficus.py                           | 0
 3 files changed, 0 insertions(+), 0 deletions(-)

### refactor: Relocate iNaturalist scripts to dedicated folder
**Author:** darklorddad
**Date:** Tue Oct 7 07:21:01 2025 +0800



 download_images_from_csv.py => iNaturalist/Download-images-from-CSV.py | 0
 image_download_checksum.txt => iNaturalist/Image-download-checksum.txt | 0
 unzip_ficus.py => iNaturalist/Unzip-Ficus.py                           | 0
 3 files changed, 0 insertions(+), 0 deletions(-)

### chore: Configure iNaturalist exporter input file
**Author:** darklorddad
**Date:** Tue Oct 7 07:14:05 2025 +0800



 iNaturalist/iNaturalist-exporter.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### chore: Configure iNaturalist exporter input file
**Author:** darklorddad
**Date:** Tue Oct 7 07:14:05 2025 +0800



 iNaturalist/iNaturalist-exporter.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### Refactor: Rename `inaturalist_exporter.py` to `iNaturalist-exporter.py`
**Author:** darklorddad
**Date:** Tue Oct 7 07:12:13 2025 +0800



 iNaturalist/{inaturalist_exporter.py => iNaturalist-exporter.py} | 0
 1 file changed, 0 insertions(+), 0 deletions(-)

### Refactor: Rename `inaturalist_exporter.py` to `iNaturalist-exporter.py`
**Author:** darklorddad
**Date:** Tue Oct 7 07:12:13 2025 +0800



 iNaturalist/{inaturalist_exporter.py => iNaturalist-exporter.py} | 0
 1 file changed, 0 insertions(+), 0 deletions(-)

### refactor: Move inaturalist_exporter.py to iNaturalist directory
**Author:** darklorddad
**Date:** Tue Oct 7 07:11:44 2025 +0800



 inaturalist_exporter.py => iNaturalist/inaturalist_exporter.py | 0
 1 file changed, 0 insertions(+), 0 deletions(-)

### refactor: Move inaturalist_exporter.py to iNaturalist directory
**Author:** darklorddad
**Date:** Tue Oct 7 07:11:44 2025 +0800



 inaturalist_exporter.py => iNaturalist/inaturalist_exporter.py | 0
 1 file changed, 0 insertions(+), 0 deletions(-)

### feat: Add script to export iNaturalist data for protected plants
**Author:** darklorddad
**Date:** Tue Oct 7 07:10:55 2025 +0800



 inaturalist_exporter.py | 101 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 101 insertions(+)

### feat: Add script to export iNaturalist data for protected plants
**Author:** darklorddad
**Date:** Tue Oct 7 07:10:55 2025 +0800



 inaturalist_exporter.py | 101 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 101 insertions(+)

### Merge branch 'main' of https://github.com/Uwe1209/SPS
**Author:** darklorddad
**Date:** Tue Oct 7 07:07:20 2025 +0800



### Merge branch 'main' of https://github.com/Uwe1209/SPS
**Author:** darklorddad
**Date:** Tue Oct 7 07:07:20 2025 +0800



### Reorganisation of files, update plant list and gitignore, files cleanup
**Author:** darklorddad
**Date:** Tue Oct 7 07:04:44 2025 +0800



 .gitignore                                                                            |     3 +-
 Documents/COS30029-Complete-Project_Proposal.docx                                     |   Bin 0 -> 2211365 bytes
 Documents/Totally-protected-and-protected-plants.md                                   |    29 +-
 Verify-CSV.py                                                                         |   141 -
 download_orchidaceae_data.py                                                          |   142 -
 download_rhododendron_data.py                                                         |   142 -
 iNaturalist/CSV/Protected/Aeschynanthus/README.txt                                    |    48 -
 iNaturalist/CSV/Protected/Aeschynanthus/observations-624555.csv                       |  2299 --------
 iNaturalist/CSV/Protected/Antiaris-toxicaria/README.txt                               |    48 -
 iNaturalist/CSV/Protected/Antiaris-toxicaria/observations-624541.csv                  |   171 -
 iNaturalist/CSV/Protected/Aquilaria-beccariana/README.txt                             |    48 -
 iNaturalist/CSV/Protected/Aquilaria-beccariana/observations-624540.csv                |     3 -
 iNaturalist/CSV/Protected/Avicennia-alba/README.txt                                   |    48 -
 iNaturalist/CSV/Protected/Avicennia-alba/observations-624499.csv                      |   269 -
 iNaturalist/CSV/Protected/Avicennia-marina/README.txt                                 |    48 -
 iNaturalist/CSV/Protected/Avicennia-marina/observations-624501.csv                    | 10363 ---------------------------------
 iNaturalist/CSV/Protected/Begonia/README.txt                                          |    48 -
 iNaturalist/CSV/Protected/Begonia/observations-624519.csv                             | 45652 --------------------------------------------------------------------------------------------------------------------------------------------------
 iNaturalist/CSV/Protected/Calophyllum-lanigerum/README.txt                            |    48 -
 iNaturalist/CSV/Protected/Calophyllum-lanigerum/observations-624545.csv               |    15 -
 iNaturalist/CSV/Protected/Casuarina-equisetifolia/README.txt                          |    48 -
 iNaturalist/CSV/Protected/Casuarina-equisetifolia/observations-624531.csv             | 13790 --------------------------------------------
 iNaturalist/CSV/Protected/Cycas-rumphii/README.txt                                    |    48 -
 iNaturalist/CSV/Protected/Cycas-rumphii/observations-624543.csv                       |    38 -
 iNaturalist/CSV/Protected/Cyrtandra/README.txt                                        |    48 -
 iNaturalist/CSV/Protected/Cyrtandra/observations-624549.csv                           |  1433 -----
 iNaturalist/CSV/Protected/Eurycoma-longifolia/README.txt                              |    48 -
 iNaturalist/CSV/Protected/Eurycoma-longifolia/observations-624544.csv                 |   214 -
 iNaturalist/CSV/Protected/Johannesteijsmannia-altifrons/README.txt                    |    48 -
 iNaturalist/CSV/Protected/Johannesteijsmannia-altifrons/observations-624537.csv       |    33 -
 iNaturalist/CSV/Protected/Koompassia-excelsa/README.txt                               |    48 -
 iNaturalist/CSV/Protected/Koompassia-excelsa/observations-624342.csv                  |   156 -
 iNaturalist/CSV/Protected/Koompassia-malaccensis/README.txt                           |    48 -
 iNaturalist/CSV/Protected/Koompassia-malaccensis/observations-624505.csv              |    29 -
 iNaturalist/CSV/Protected/Licuala-orbicularis/README.txt                              |    48 -
 iNaturalist/CSV/Protected/Licuala-orbicularis/observations-624538.csv                 |    24 -
 iNaturalist/CSV/Protected/Lumnitzera-littorrea/README.txt                             |    48 -
 iNaturalist/CSV/Protected/Lumnitzera-littorrea/observations-624510.csv                |   246 -
 iNaturalist/CSV/Protected/Monophyllaea/README.txt                                     |    48 -
 iNaturalist/CSV/Protected/Monophyllaea/observations-624563.csv                        |   279 -
 iNaturalist/CSV/Protected/Nepenthes/README.txt                                        |    48 -
 iNaturalist/CSV/Protected/Nepenthes/observations-624558.csv                           | 10326 ---------------------------------
 iNaturalist/CSV/Protected/Rubroshorea-macrophylla/README.txt                          |    48 -
 iNaturalist/CSV/Protected/Rubroshorea-macrophylla/observations-624498.csv             |    11 -
 iNaturalist/CSV/Protected/Rubroshorea-palembanica/README.txt                          |    48 -
 iNaturalist/CSV/Protected/Rubroshorea-palembanica/observations-624509.csv             |     4 -
 iNaturalist/CSV/Protected/Rubroshorea-stenoptera/README.txt                           |    48 -
 iNaturalist/CSV/Protected/Rubroshorea-stenoptera/observations-624317.csv              |     4 -
 iNaturalist/CSV/Protected/Sonneratia-alba/README.txt                                  |    48 -
 iNaturalist/CSV/Protected/Sonneratia-alba/observations-624500.csv                     |  1209 ----
 iNaturalist/CSV/Protected/Sonneratia-caseolaris/README.txt                            |    48 -
 iNaturalist/CSV/Protected/Sonneratia-caseolaris/observations-624516.csv               |   778 ---
 iNaturalist/CSV/Totally-protected/Dipterocarpus-oblongifolius/README.txt              |    48 -
 iNaturalist/CSV/Totally-protected/Dipterocarpus-oblongifolius/observations-624217.csv |    42 -
 iNaturalist/CSV/Totally-protected/Rafflesia/README.txt                                |    48 -
 iNaturalist/CSV/Totally-protected/Rafflesia/observations-624316.csv                   |  1060 ----
 iNaturalist/Dataset-notes.md                                                          |    55 -
 iNaturalist/iNaturalist-notes.md                                                      |    89 +
 image_download_checksum.txt                                                           |  1928 +++++++
 verify_csv_downloads.py                                                               |   109 -
 verify_images.py                                                                      |   119 -
 61 files changed, 2035 insertions(+), 90370 deletions(-)

### Reorganisation of files, update plant list and gitignore, files cleanup
**Author:** darklorddad
**Date:** Tue Oct 7 07:04:44 2025 +0800



 .gitignore                                                                            |     3 +-
 Documents/COS30029-Complete-Project_Proposal.docx                                     |   Bin 0 -> 2211365 bytes
 Documents/Totally-protected-and-protected-plants.md                                   |    29 +-
 Verify-CSV.py                                                                         |   141 -
 download_orchidaceae_data.py                                                          |   142 -
 download_rhododendron_data.py                                                         |   142 -
 iNaturalist/CSV/Protected/Aeschynanthus/README.txt                                    |    48 -
 iNaturalist/CSV/Protected/Aeschynanthus/observations-624555.csv                       |  2299 --------
 iNaturalist/CSV/Protected/Antiaris-toxicaria/README.txt                               |    48 -
 iNaturalist/CSV/Protected/Antiaris-toxicaria/observations-624541.csv                  |   171 -
 iNaturalist/CSV/Protected/Aquilaria-beccariana/README.txt                             |    48 -
 iNaturalist/CSV/Protected/Aquilaria-beccariana/observations-624540.csv                |     3 -
 iNaturalist/CSV/Protected/Avicennia-alba/README.txt                                   |    48 -
 iNaturalist/CSV/Protected/Avicennia-alba/observations-624499.csv                      |   269 -
 iNaturalist/CSV/Protected/Avicennia-marina/README.txt                                 |    48 -
 iNaturalist/CSV/Protected/Avicennia-marina/observations-624501.csv                    | 10363 ---------------------------------
 iNaturalist/CSV/Protected/Begonia/README.txt                                          |    48 -
 iNaturalist/CSV/Protected/Begonia/observations-624519.csv                             | 45652 --------------------------------------------------------------------------------------------------------------------------------------------------
 iNaturalist/CSV/Protected/Calophyllum-lanigerum/README.txt                            |    48 -
 iNaturalist/CSV/Protected/Calophyllum-lanigerum/observations-624545.csv               |    15 -
 iNaturalist/CSV/Protected/Casuarina-equisetifolia/README.txt                          |    48 -
 iNaturalist/CSV/Protected/Casuarina-equisetifolia/observations-624531.csv             | 13790 --------------------------------------------
 iNaturalist/CSV/Protected/Cycas-rumphii/README.txt                                    |    48 -
 iNaturalist/CSV/Protected/Cycas-rumphii/observations-624543.csv                       |    38 -
 iNaturalist/CSV/Protected/Cyrtandra/README.txt                                        |    48 -
 iNaturalist/CSV/Protected/Cyrtandra/observations-624549.csv                           |  1433 -----
 iNaturalist/CSV/Protected/Eurycoma-longifolia/README.txt                              |    48 -
 iNaturalist/CSV/Protected/Eurycoma-longifolia/observations-624544.csv                 |   214 -
 iNaturalist/CSV/Protected/Johannesteijsmannia-altifrons/README.txt                    |    48 -
 iNaturalist/CSV/Protected/Johannesteijsmannia-altifrons/observations-624537.csv       |    33 -
 iNaturalist/CSV/Protected/Koompassia-excelsa/README.txt                               |    48 -
 iNaturalist/CSV/Protected/Koompassia-excelsa/observations-624342.csv                  |   156 -
 iNaturalist/CSV/Protected/Koompassia-malaccensis/README.txt                           |    48 -
 iNaturalist/CSV/Protected/Koompassia-malaccensis/observations-624505.csv              |    29 -
 iNaturalist/CSV/Protected/Licuala-orbicularis/README.txt                              |    48 -
 iNaturalist/CSV/Protected/Licuala-orbicularis/observations-624538.csv                 |    24 -
 iNaturalist/CSV/Protected/Lumnitzera-littorrea/README.txt                             |    48 -
 iNaturalist/CSV/Protected/Lumnitzera-littorrea/observations-624510.csv                |   246 -
 iNaturalist/CSV/Protected/Monophyllaea/README.txt                                     |    48 -
 iNaturalist/CSV/Protected/Monophyllaea/observations-624563.csv                        |   279 -
 iNaturalist/CSV/Protected/Nepenthes/README.txt                                        |    48 -
 iNaturalist/CSV/Protected/Nepenthes/observations-624558.csv                           | 10326 ---------------------------------
 iNaturalist/CSV/Protected/Rubroshorea-macrophylla/README.txt                          |    48 -
 iNaturalist/CSV/Protected/Rubroshorea-macrophylla/observations-624498.csv             |    11 -
 iNaturalist/CSV/Protected/Rubroshorea-palembanica/README.txt                          |    48 -
 iNaturalist/CSV/Protected/Rubroshorea-palembanica/observations-624509.csv             |     4 -
 iNaturalist/CSV/Protected/Rubroshorea-stenoptera/README.txt                           |    48 -
 iNaturalist/CSV/Protected/Rubroshorea-stenoptera/observations-624317.csv              |     4 -
 iNaturalist/CSV/Protected/Sonneratia-alba/README.txt                                  |    48 -
 iNaturalist/CSV/Protected/Sonneratia-alba/observations-624500.csv                     |  1209 ----
 iNaturalist/CSV/Protected/Sonneratia-caseolaris/README.txt                            |    48 -
 iNaturalist/CSV/Protected/Sonneratia-caseolaris/observations-624516.csv               |   778 ---
 iNaturalist/CSV/Totally-protected/Dipterocarpus-oblongifolius/README.txt              |    48 -
 iNaturalist/CSV/Totally-protected/Dipterocarpus-oblongifolius/observations-624217.csv |    42 -
 iNaturalist/CSV/Totally-protected/Rafflesia/README.txt                                |    48 -
 iNaturalist/CSV/Totally-protected/Rafflesia/observations-624316.csv                   |  1060 ----
 iNaturalist/Dataset-notes.md                                                          |    55 -
 iNaturalist/iNaturalist-notes.md                                                      |    89 +
 image_download_checksum.txt                                                           |  1928 +++++++
 verify_csv_downloads.py                                                               |   109 -
 verify_images.py                                                                      |   119 -
 61 files changed, 2035 insertions(+), 90370 deletions(-)

### feat: Add script to verify iNaturalist CSV data completeness
**Author:** darklorddad
**Date:** Tue Oct 7 05:29:07 2025 +0800



 verify_csv_downloads.py | 109 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 109 insertions(+)

### feat: Add script to verify iNaturalist CSV data completeness
**Author:** darklorddad
**Date:** Tue Oct 7 05:29:07 2025 +0800



 verify_csv_downloads.py | 109 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 109 insertions(+)

### refactor: Remove year-specific verification logic from iNaturalist CSV check.
**Author:** darklorddad
**Date:** Tue Oct 7 05:21:54 2025 +0800



 Verify-CSV.py | 12 ++----------
 1 file changed, 2 insertions(+), 10 deletions(-)

### refactor: Remove year-specific verification logic from iNaturalist CSV check.
**Author:** darklorddad
**Date:** Tue Oct 7 05:21:54 2025 +0800



 Verify-CSV.py | 12 ++----------
 1 file changed, 2 insertions(+), 10 deletions(-)

### Update .gitignore
**Author:** darklorddad
**Date:** Mon Oct 6 16:42:55 2025 +0800



 .gitignore | 2 ++
 1 file changed, 2 insertions(+)

### Update .gitignore
**Author:** darklorddad
**Date:** Mon Oct 6 16:42:55 2025 +0800



 .gitignore | 2 ++
 1 file changed, 2 insertions(+)

### refactor: Read taxon ID from CSV header instead of map
**Author:** darklorddad
**Date:** Mon Oct 6 16:32:18 2025 +0800



 Verify-CSV.py | 50 ++++++++++++++------------------------------------
 1 file changed, 14 insertions(+), 36 deletions(-)

### refactor: Read taxon ID from CSV header instead of map
**Author:** darklorddad
**Date:** Mon Oct 6 16:32:18 2025 +0800



 Verify-CSV.py | 50 ++++++++++++++------------------------------------
 1 file changed, 14 insertions(+), 36 deletions(-)

### refactor: Infer taxon ID from directory name for CSV verification
**Author:** darklorddad
**Date:** Mon Oct 6 16:30:25 2025 +0800



 Verify-CSV.py | 54 ++++++++++++++++++++++++++++++++++++++----------------
 1 file changed, 38 insertions(+), 16 deletions(-)

### refactor: Infer taxon ID from directory name for CSV verification
**Author:** darklorddad
**Date:** Mon Oct 6 16:30:25 2025 +0800



 Verify-CSV.py | 54 ++++++++++++++++++++++++++++++++++++++----------------
 1 file changed, 38 insertions(+), 16 deletions(-)

### docs: Expand protected plant lists and remove obsolete scripts
**Author:** darklorddad
**Date:** Mon Oct 6 16:26:04 2025 +0800



 Documents/Totally-protected-and-protected-plants.md |  23 +++++++++++++++++++++--
 verify_downloads.py => Verify-CSV.py                |   0
 generate_orchidaceae_urls.py                        | 165 ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
 iNaturalist/Dataset-notes.md                        |  12 ++++--------
 iNaturalist/query_script.py                         |  26 --------------------------
 unzip_all.py                                        |  33 ---------------------------------
 6 files changed, 25 insertions(+), 234 deletions(-)

### docs: Expand protected plant lists and remove obsolete scripts
**Author:** darklorddad
**Date:** Mon Oct 6 16:26:04 2025 +0800



 Documents/Totally-protected-and-protected-plants.md |  23 +++++++++++++++++++++--
 verify_downloads.py => Verify-CSV.py                |   0
 generate_orchidaceae_urls.py                        | 165 ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
 iNaturalist/Dataset-notes.md                        |  12 ++++--------
 iNaturalist/query_script.py                         |  26 --------------------------
 unzip_all.py                                        |  33 ---------------------------------
 6 files changed, 25 insertions(+), 234 deletions(-)

### refactor: Overhaul CSV verification; add dynamic scanning and threading
**Author:** darklorddad
**Date:** Mon Oct 6 16:22:47 2025 +0800



 verify_downloads.py | 153 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++---------------------------------------------------
 1 file changed, 102 insertions(+), 51 deletions(-)

### refactor: Overhaul CSV verification; add dynamic scanning and threading
**Author:** darklorddad
**Date:** Mon Oct 6 16:22:47 2025 +0800



 verify_downloads.py | 153 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++---------------------------------------------------
 1 file changed, 102 insertions(+), 51 deletions(-)

### feat: Add script to verify downloaded images against CSV
**Author:** darklorddad
**Date:** Mon Oct 6 16:10:10 2025 +0800



 verify_images.py | 119 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 119 insertions(+)

### feat: Add script to verify downloaded images against CSV
**Author:** darklorddad
**Date:** Mon Oct 6 16:10:10 2025 +0800



 verify_images.py | 119 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 119 insertions(+)

### feat: Add script to verify iNaturalist CSV downloads against API
**Author:** darklorddad
**Date:** Mon Oct 6 16:03:39 2025 +0800



 verify_downloads.py | 98 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 98 insertions(+)

### feat: Add script to verify iNaturalist CSV downloads against API
**Author:** darklorddad
**Date:** Mon Oct 6 16:03:39 2025 +0800



 verify_downloads.py | 98 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 98 insertions(+)

### refactor: Use iNaturalist v1 JSON API for observation data, including UUID
**Author:** darklorddad
**Date:** Mon Oct 6 15:42:44 2025 +0800



 download_orchidaceae_data.py  | 143 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-------------------------
 download_rhododendron_data.py | 143 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-------------------------
 2 files changed, 236 insertions(+), 50 deletions(-)

### refactor: Use iNaturalist v1 JSON API for observation data, including UUID
**Author:** darklorddad
**Date:** Mon Oct 6 15:42:44 2025 +0800



 download_orchidaceae_data.py  | 143 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-------------------------
 download_rhododendron_data.py | 143 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-------------------------
 2 files changed, 236 insertions(+), 50 deletions(-)

### fix: Request all specified iNaturalist observation columns
**Author:** darklorddad
**Date:** Mon Oct 6 15:39:02 2025 +0800



 download_orchidaceae_data.py  | 2 +-
 download_rhododendron_data.py | 2 +-
 2 files changed, 2 insertions(+), 2 deletions(-)

### fix: Request all specified iNaturalist observation columns
**Author:** darklorddad
**Date:** Mon Oct 6 15:39:02 2025 +0800



 download_orchidaceae_data.py  | 2 +-
 download_rhododendron_data.py | 2 +-
 2 files changed, 2 insertions(+), 2 deletions(-)

### fix: Correct iNaturalist API parameters for CSV downloads
**Author:** darklorddad
**Date:** Mon Oct 6 15:37:14 2025 +0800



 download_orchidaceae_data.py  | 2 +-
 download_rhododendron_data.py | 2 +-
 2 files changed, 2 insertions(+), 2 deletions(-)

### fix: Correct iNaturalist API parameters for CSV downloads
**Author:** darklorddad
**Date:** Mon Oct 6 15:37:14 2025 +0800



 download_orchidaceae_data.py  | 2 +-
 download_rhododendron_data.py | 2 +-
 2 files changed, 2 insertions(+), 2 deletions(-)

### fix: Include UUID and other fields in iNaturalist CSV downloads
**Author:** darklorddad
**Date:** Mon Oct 6 15:28:33 2025 +0800



 download_orchidaceae_data.py  | 3 ++-
 download_rhododendron_data.py | 3 ++-
 2 files changed, 4 insertions(+), 2 deletions(-)

### fix: Include UUID and other fields in iNaturalist CSV downloads
**Author:** darklorddad
**Date:** Mon Oct 6 15:28:33 2025 +0800



 download_orchidaceae_data.py  | 3 ++-
 download_rhododendron_data.py | 3 ++-
 2 files changed, 4 insertions(+), 2 deletions(-)

### chore: Set image output directory to absolute path
**Author:** darklorddad
**Date:** Mon Oct 6 15:17:08 2025 +0800



 download_images_from_csv.py | 3 +--
 1 file changed, 1 insertion(+), 2 deletions(-)

### chore: Set image output directory to absolute path
**Author:** darklorddad
**Date:** Mon Oct 6 15:17:08 2025 +0800



 download_images_from_csv.py | 3 +--
 1 file changed, 1 insertion(+), 2 deletions(-)

### feat: Add script to download and organise images from CSVs with checksum
**Author:** darklorddad
**Date:** Mon Oct 6 15:16:31 2025 +0800



 download_images_from_csv.py | 126 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 126 insertions(+)

### feat: Add script to download and organise images from CSVs with checksum
**Author:** darklorddad
**Date:** Mon Oct 6 15:16:31 2025 +0800



 download_images_from_csv.py | 126 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 126 insertions(+)

### feat: Add script to download Rhododendron observation data from iNaturalist
**Author:** darklorddad
**Date:** Mon Oct 6 14:29:55 2025 +0800



 download_rhododendron_data.py | 48 ++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 48 insertions(+)

### feat: Add script to download Rhododendron observation data from iNaturalist
**Author:** darklorddad
**Date:** Mon Oct 6 14:29:55 2025 +0800



 download_rhododendron_data.py | 48 ++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 48 insertions(+)

### feat: Add script to download iNaturalist Orchidaceae data by year
**Author:** darklorddad
**Date:** Mon Oct 6 14:22:36 2025 +0800



 download_orchidaceae_data.py | 48 ++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 48 insertions(+)

### feat: Add script to download iNaturalist Orchidaceae data by year
**Author:** darklorddad
**Date:** Mon Oct 6 14:22:36 2025 +0800



 download_orchidaceae_data.py | 48 ++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 48 insertions(+)

### fix: Improve login detection by targeting user menu
**Author:** darklorddad
**Date:** Mon Oct 6 14:17:18 2025 +0800



 generate_orchidaceae_urls.py | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)

### fix: Improve login detection by targeting user menu
**Author:** darklorddad
**Date:** Mon Oct 6 14:17:18 2025 +0800



 generate_orchidaceae_urls.py | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)

### fix: Use undetected_chromedriver to bypass bot detection
**Author:** darklorddad
**Date:** Mon Oct 6 14:14:32 2025 +0800



 generate_orchidaceae_urls.py | 4 +++-
 1 file changed, 3 insertions(+), 1 deletion(-)

### fix: Use undetected_chromedriver to bypass bot detection
**Author:** darklorddad
**Date:** Mon Oct 6 14:14:32 2025 +0800



 generate_orchidaceae_urls.py | 4 +++-
 1 file changed, 3 insertions(+), 1 deletion(-)

### fix: Make login clicks more robust with JavaScript
**Author:** darklorddad
**Date:** Mon Oct 6 14:12:38 2025 +0800



 generate_orchidaceae_urls.py | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### fix: Make login clicks more robust with JavaScript
**Author:** darklorddad
**Date:** Mon Oct 6 14:12:38 2025 +0800



 generate_orchidaceae_urls.py | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### fix: Correct iNaturalist login button selectors
**Author:** darklorddad
**Date:** Mon Oct 6 14:10:17 2025 +0800



 generate_orchidaceae_urls.py | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### fix: Correct iNaturalist login button selectors
**Author:** darklorddad
**Date:** Mon Oct 6 14:10:17 2025 +0800



 generate_orchidaceae_urls.py | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

### fix: Adjust iNaturalist login for 'Show more options' button
**Author:** darklorddad
**Date:** Mon Oct 6 13:56:11 2025 +0800



 generate_orchidaceae_urls.py | 11 ++++++++---
 1 file changed, 8 insertions(+), 3 deletions(-)

### fix: Adjust iNaturalist login for 'Show more options' button
**Author:** darklorddad
**Date:** Mon Oct 6 13:56:11 2025 +0800



 generate_orchidaceae_urls.py | 11 ++++++++---
 1 file changed, 8 insertions(+), 3 deletions(-)

### fix: Accept iNaturalist cookie banner before Google login
**Author:** darklorddad
**Date:** Mon Oct 6 13:52:47 2025 +0800



 generate_orchidaceae_urls.py | 24 ++++++++++++++++++++----
 1 file changed, 20 insertions(+), 4 deletions(-)

### fix: Accept iNaturalist cookie banner before Google login
**Author:** darklorddad
**Date:** Mon Oct 6 13:52:47 2025 +0800



 generate_orchidaceae_urls.py | 24 ++++++++++++++++++++----
 1 file changed, 20 insertions(+), 4 deletions(-)

### feat: Add interactive Google OAuth login for iNaturalist
**Author:** darklorddad
**Date:** Mon Oct 6 13:49:44 2025 +0800



 generate_orchidaceae_urls.py | 48 ++++++++++++++++++++++++++----------------------
 1 file changed, 26 insertions(+), 22 deletions(-)

### feat: Add interactive Google OAuth login for iNaturalist
**Author:** darklorddad
**Date:** Mon Oct 6 13:49:44 2025 +0800



 generate_orchidaceae_urls.py | 48 ++++++++++++++++++++++++++----------------------
 1 file changed, 26 insertions(+), 22 deletions(-)

### feat: Automate iNaturalist data export and download
**Author:** darklorddad
**Date:** Mon Oct 6 13:47:47 2025 +0800



 generate_orchidaceae_urls.py | 154 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++---------------------------
 1 file changed, 127 insertions(+), 27 deletions(-)

### feat: Automate iNaturalist data export and download
**Author:** darklorddad
**Date:** Mon Oct 6 13:47:47 2025 +0800



 generate_orchidaceae_urls.py | 154 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++---------------------------
 1 file changed, 127 insertions(+), 27 deletions(-)

### feat: Add script to generate iNaturalist Orchidaceae export URLs
**Author:** darklorddad
**Date:** Mon Oct 6 13:45:28 2025 +0800



 generate_orchidaceae_urls.py | 37 +++++++++++++++++++++++++++++++++++++
 1 file changed, 37 insertions(+)

### feat: Add script to generate iNaturalist Orchidaceae export URLs
**Author:** darklorddad
**Date:** Mon Oct 6 13:45:28 2025 +0800



 generate_orchidaceae_urls.py | 37 +++++++++++++++++++++++++++++++++++++
 1 file changed, 37 insertions(+)

### feat: Add script to extract Ficus zip files
**Author:** darklorddad
**Date:** Mon Oct 6 13:40:09 2025 +0800



 unzip_ficus.py | 44 ++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 44 insertions(+)

### feat: Add script to extract Ficus zip files
**Author:** darklorddad
**Date:** Mon Oct 6 13:40:09 2025 +0800



 unzip_ficus.py | 44 ++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 44 insertions(+)

### feat: Add script to recursively unzip all files in iNaturalist/CSV
**Author:** darklorddad
**Date:** Mon Oct 6 13:34:08 2025 +0800



 unzip_all.py | 33 +++++++++++++++++++++++++++++++++
 1 file changed, 33 insertions(+)

### feat: Add script to recursively unzip all files in iNaturalist/CSV
**Author:** darklorddad
**Date:** Mon Oct 6 13:34:08 2025 +0800



 unzip_all.py | 33 +++++++++++++++++++++++++++++++++
 1 file changed, 33 insertions(+)

### feat: Add script to generate iNaturalist yearly query URLs
**Author:** darklorddad
**Date:** Mon Oct 6 12:35:26 2025 +0800



 iNaturalist/query_script.py | 26 ++++++++++++++++++++++++++
 1 file changed, 26 insertions(+)

### feat: Add script to generate iNaturalist yearly query URLs
**Author:** darklorddad
**Date:** Mon Oct 6 12:35:26 2025 +0800



 iNaturalist/query_script.py | 26 ++++++++++++++++++++++++++
 1 file changed, 26 insertions(+)

### chore: Delete SmartPlant/.gitignore
**Author:** darklorddad
**Date:** Mon Oct 6 12:26:12 2025 +0800



 SmartPlant/.gitignore | 41 -----------------------------------------
 1 file changed, 41 deletions(-)

### chore: Delete SmartPlant/.gitignore
**Author:** darklorddad
**Date:** Mon Oct 6 12:26:12 2025 +0800



 SmartPlant/.gitignore | 41 -----------------------------------------
 1 file changed, 41 deletions(-)

### chore: Add common ignore patterns for JS/React Native/Expo
**Author:** darklorddad
**Date:** Mon Oct 6 12:25:56 2025 +0800



 .gitignore | 42 ++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 42 insertions(+)

### chore: Add common ignore patterns for JS/React Native/Expo
**Author:** darklorddad
**Date:** Mon Oct 6 12:25:56 2025 +0800



 .gitignore | 42 ++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 42 insertions(+)

### Merge branch 'main' of https://github.com/Uwe1209/SPS
**Author:** darklorddad
**Date:** Mon Oct 6 12:24:53 2025 +0800



### Merge branch 'main' of https://github.com/Uwe1209/SPS
**Author:** darklorddad
**Date:** Mon Oct 6 12:24:53 2025 +0800



### refactor: Move Dataset-notes.md to iNaturalist directory
**Author:** darklorddad
**Date:** Mon Oct 6 12:24:42 2025 +0800



 Dataset-notes.md => iNaturalist/Dataset-notes.md | 0
 1 file changed, 0 insertions(+), 0 deletions(-)

### refactor: Move Dataset-notes.md to iNaturalist directory
**Author:** darklorddad
**Date:** Mon Oct 6 12:24:42 2025 +0800



 Dataset-notes.md => iNaturalist/Dataset-notes.md | 0
 1 file changed, 0 insertions(+), 0 deletions(-)

### feat: Add additional iNaturalist data
**Author:** darklorddad
**Date:** Mon Oct 6 12:20:25 2025 +0800



 iNaturalist/CSV/Protected/Aeschynanthus/README.txt                              |    48 +
 iNaturalist/CSV/Protected/Aeschynanthus/observations-624555.csv                 |  2299 ++++++++
 iNaturalist/CSV/Protected/Antiaris-toxicaria/README.txt                         |    48 +
 iNaturalist/CSV/Protected/Antiaris-toxicaria/observations-624541.csv            |   171 +
 iNaturalist/CSV/Protected/Aquilaria-beccariana/README.txt                       |    48 +
 iNaturalist/CSV/Protected/Aquilaria-beccariana/observations-624540.csv          |     3 +
 iNaturalist/CSV/Protected/Avicennia-alba/README.txt                             |    48 +
 iNaturalist/CSV/Protected/Avicennia-alba/observations-624499.csv                |   269 +
 iNaturalist/CSV/Protected/Avicennia-marina/README.txt                           |    48 +
 iNaturalist/CSV/Protected/Avicennia-marina/observations-624501.csv              | 10363 +++++++++++++++++++++++++++++++++++
 iNaturalist/CSV/Protected/Begonia/README.txt                                    |    48 +
 iNaturalist/CSV/Protected/Begonia/observations-624519.csv                       | 45652 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 iNaturalist/CSV/Protected/Calophyllum-lanigerum/README.txt                      |    48 +
 iNaturalist/CSV/Protected/Calophyllum-lanigerum/observations-624545.csv         |    15 +
 iNaturalist/CSV/Protected/Casuarina-equisetifolia/README.txt                    |    48 +
 iNaturalist/CSV/Protected/Casuarina-equisetifolia/observations-624531.csv       | 13790 ++++++++++++++++++++++++++++++++++++++++++++++
 iNaturalist/CSV/Protected/Cycas-rumphii/README.txt                              |    48 +
 iNaturalist/CSV/Protected/Cycas-rumphii/observations-624543.csv                 |    38 +
 iNaturalist/CSV/Protected/Cyrtandra/README.txt                                  |    48 +
 iNaturalist/CSV/Protected/Cyrtandra/observations-624549.csv                     |  1433 +++++
 iNaturalist/CSV/Protected/Eurycoma-longifolia/README.txt                        |    48 +
 iNaturalist/CSV/Protected/Eurycoma-longifolia/observations-624544.csv           |   214 +
 iNaturalist/CSV/Protected/Johannesteijsmannia-altifrons/README.txt              |    48 +
 iNaturalist/CSV/Protected/Johannesteijsmannia-altifrons/observations-624537.csv |    33 +
 iNaturalist/CSV/Protected/Koompassia-excelsa/README.txt                         |    48 +
 iNaturalist/CSV/Protected/Koompassia-excelsa/observations-624342.csv            |   156 +
 iNaturalist/CSV/Protected/Koompassia-malaccensis/README.txt                     |    48 +
 iNaturalist/CSV/Protected/Koompassia-malaccensis/observations-624505.csv        |    29 +
 iNaturalist/CSV/Protected/Licuala-orbicularis/README.txt                        |    48 +
 iNaturalist/CSV/Protected/Licuala-orbicularis/observations-624538.csv           |    24 +
 iNaturalist/CSV/Protected/Lumnitzera-littorrea/README.txt                       |    48 +
 iNaturalist/CSV/Protected/Lumnitzera-littorrea/observations-624510.csv          |   246 +
 iNaturalist/CSV/Protected/Monophyllaea/README.txt                               |    48 +
 iNaturalist/CSV/Protected/Monophyllaea/observations-624563.csv                  |   279 +
 iNaturalist/CSV/Protected/Nepenthes/README.txt                                  |    48 +
 iNaturalist/CSV/Protected/Nepenthes/observations-624558.csv                     | 10326 +++++++++++++++++++++++++++++++++++
 iNaturalist/CSV/Protected/Rubroshorea-macrophylla/README.txt                    |    48 +
 iNaturalist/CSV/Protected/Rubroshorea-macrophylla/observations-624498.csv       |    11 +
 iNaturalist/CSV/Protected/Rubroshorea-palembanica/README.txt                    |    48 +
 iNaturalist/CSV/Protected/Rubroshorea-palembanica/observations-624509.csv       |     4 +
 iNaturalist/CSV/Protected/Rubroshorea-stenoptera/README.txt                     |    48 +
 iNaturalist/CSV/Protected/Rubroshorea-stenoptera/observations-624317.csv        |     4 +
 iNaturalist/CSV/Protected/Sonneratia-alba/README.txt                            |    48 +
 iNaturalist/CSV/Protected/Sonneratia-alba/observations-624500.csv               |  1209 ++++
 iNaturalist/CSV/Protected/Sonneratia-caseolaris/README.txt                      |    48 +
 iNaturalist/CSV/Protected/Sonneratia-caseolaris/observations-624516.csv         |   778 +++
 46 files changed, 88450 insertions(+)

### feat: Add additional iNaturalist data
**Author:** darklorddad
**Date:** Mon Oct 6 12:20:25 2025 +0800



 iNaturalist/CSV/Protected/Aeschynanthus/README.txt                              |    48 +
 iNaturalist/CSV/Protected/Aeschynanthus/observations-624555.csv                 |  2299 ++++++++
 iNaturalist/CSV/Protected/Antiaris-toxicaria/README.txt                         |    48 +
 iNaturalist/CSV/Protected/Antiaris-toxicaria/observations-624541.csv            |   171 +
 iNaturalist/CSV/Protected/Aquilaria-beccariana/README.txt                       |    48 +
 iNaturalist/CSV/Protected/Aquilaria-beccariana/observations-624540.csv          |     3 +
 iNaturalist/CSV/Protected/Avicennia-alba/README.txt                             |    48 +
 iNaturalist/CSV/Protected/Avicennia-alba/observations-624499.csv                |   269 +
 iNaturalist/CSV/Protected/Avicennia-marina/README.txt                           |    48 +
 iNaturalist/CSV/Protected/Avicennia-marina/observations-624501.csv              | 10363 +++++++++++++++++++++++++++++++++++
 iNaturalist/CSV/Protected/Begonia/README.txt                                    |    48 +
 iNaturalist/CSV/Protected/Begonia/observations-624519.csv                       | 45652 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 iNaturalist/CSV/Protected/Calophyllum-lanigerum/README.txt                      |    48 +
 iNaturalist/CSV/Protected/Calophyllum-lanigerum/observations-624545.csv         |    15 +
 iNaturalist/CSV/Protected/Casuarina-equisetifolia/README.txt                    |    48 +
 iNaturalist/CSV/Protected/Casuarina-equisetifolia/observations-624531.csv       | 13790 ++++++++++++++++++++++++++++++++++++++++++++++
 iNaturalist/CSV/Protected/Cycas-rumphii/README.txt                              |    48 +
 iNaturalist/CSV/Protected/Cycas-rumphii/observations-624543.csv                 |    38 +
 iNaturalist/CSV/Protected/Cyrtandra/README.txt                                  |    48 +
 iNaturalist/CSV/Protected/Cyrtandra/observations-624549.csv                     |  1433 +++++
 iNaturalist/CSV/Protected/Eurycoma-longifolia/README.txt                        |    48 +
 iNaturalist/CSV/Protected/Eurycoma-longifolia/observations-624544.csv           |   214 +
 iNaturalist/CSV/Protected/Johannesteijsmannia-altifrons/README.txt              |    48 +
 iNaturalist/CSV/Protected/Johannesteijsmannia-altifrons/observations-624537.csv |    33 +
 iNaturalist/CSV/Protected/Koompassia-excelsa/README.txt                         |    48 +
 iNaturalist/CSV/Protected/Koompassia-excelsa/observations-624342.csv            |   156 +
 iNaturalist/CSV/Protected/Koompassia-malaccensis/README.txt                     |    48 +
 iNaturalist/CSV/Protected/Koompassia-malaccensis/observations-624505.csv        |    29 +
 iNaturalist/CSV/Protected/Licuala-orbicularis/README.txt                        |    48 +
 iNaturalist/CSV/Protected/Licuala-orbicularis/observations-624538.csv           |    24 +
 iNaturalist/CSV/Protected/Lumnitzera-littorrea/README.txt                       |    48 +
 iNaturalist/CSV/Protected/Lumnitzera-littorrea/observations-624510.csv          |   246 +
 iNaturalist/CSV/Protected/Monophyllaea/README.txt                               |    48 +
 iNaturalist/CSV/Protected/Monophyllaea/observations-624563.csv                  |   279 +
 iNaturalist/CSV/Protected/Nepenthes/README.txt                                  |    48 +
 iNaturalist/CSV/Protected/Nepenthes/observations-624558.csv                     | 10326 +++++++++++++++++++++++++++++++++++
 iNaturalist/CSV/Protected/Rubroshorea-macrophylla/README.txt                    |    48 +
 iNaturalist/CSV/Protected/Rubroshorea-macrophylla/observations-624498.csv       |    11 +
 iNaturalist/CSV/Protected/Rubroshorea-palembanica/README.txt                    |    48 +
 iNaturalist/CSV/Protected/Rubroshorea-palembanica/observations-624509.csv       |     4 +
 iNaturalist/CSV/Protected/Rubroshorea-stenoptera/README.txt                     |    48 +
 iNaturalist/CSV/Protected/Rubroshorea-stenoptera/observations-624317.csv        |     4 +
 iNaturalist/CSV/Protected/Sonneratia-alba/README.txt                            |    48 +
 iNaturalist/CSV/Protected/Sonneratia-alba/observations-624500.csv               |  1209 ++++
 iNaturalist/CSV/Protected/Sonneratia-caseolaris/README.txt                      |    48 +
 iNaturalist/CSV/Protected/Sonneratia-caseolaris/observations-624516.csv         |   778 +++
 46 files changed, 88450 insertions(+)

### feat: Add iNaturalist data for protected Dipterocarpus and Rafflesia
**Author:** darklorddad
**Date:** Mon Oct 6 12:18:57 2025 +0800



 iNaturalist/CSV/Totally-protected/Dipterocarpus-oblongifolius/README.txt              |   48 +++++++
 iNaturalist/CSV/Totally-protected/Dipterocarpus-oblongifolius/observations-624217.csv |   42 ++++++
 iNaturalist/CSV/Totally-protected/Rafflesia/README.txt                                |   48 +++++++
 iNaturalist/CSV/Totally-protected/Rafflesia/observations-624316.csv                   | 1060 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 4 files changed, 1198 insertions(+)

### feat: Add iNaturalist data for protected Dipterocarpus and Rafflesia
**Author:** darklorddad
**Date:** Mon Oct 6 12:18:57 2025 +0800



 iNaturalist/CSV/Totally-protected/Dipterocarpus-oblongifolius/README.txt              |   48 +++++++
 iNaturalist/CSV/Totally-protected/Dipterocarpus-oblongifolius/observations-624217.csv |   42 ++++++
 iNaturalist/CSV/Totally-protected/Rafflesia/README.txt                                |   48 +++++++
 iNaturalist/CSV/Totally-protected/Rafflesia/observations-624316.csv                   | 1060 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 4 files changed, 1198 insertions(+)

### Add system design proposal templates and submission PDF
**Author:** darklorddad
**Date:** Mon Oct 6 12:17:42 2025 +0800

Added Word and PDF templates for the COS30029 project proposal, as well as the system design proposal submission PDF, to the resources directory for assignment submissions.


 Documents/Resources/System-Design-Proposal-Submission/Assignment-Submission/COS30029-Complete-Project_Proposal_Template.docx | Bin 0 -> 25088 bytes
 Documents/Resources/System-Design-Proposal-Submission/Assignment-Submission/COS30029-Complete-Project_Proposal_Template.pdf  | Bin 0 -> 163872 bytes
 Documents/Resources/System-Design-Proposal-Submission/System-Design-Proposal-Submission.pdf                                  | Bin 0 -> 105864 bytes
 3 files changed, 0 insertions(+), 0 deletions(-)

### Add system design proposal templates and submission PDF
**Author:** darklorddad
**Date:** Mon Oct 6 12:17:42 2025 +0800

Added Word and PDF templates for the COS30029 project proposal, as well as the system design proposal submission PDF, to the resources directory for assignment submissions.


 Documents/Resources/System-Design-Proposal-Submission/Assignment-Submission/COS30029-Complete-Project_Proposal_Template.docx | Bin 0 -> 25088 bytes
 Documents/Resources/System-Design-Proposal-Submission/Assignment-Submission/COS30029-Complete-Project_Proposal_Template.pdf  | Bin 0 -> 163872 bytes
 Documents/Resources/System-Design-Proposal-Submission/System-Design-Proposal-Submission.pdf                                  | Bin 0 -> 105864 bytes
 3 files changed, 0 insertions(+), 0 deletions(-)

### Add assessment resources and marking rubrics
**Author:** darklorddad
**Date:** Mon Oct 6 12:17:25 2025 +0800

Added project scope, project information, and marking rubric files (PDF and XLSX) for COS30049 Computing Technology Innovation Project. These resources provide essential information and assessment criteria for the project.


 Documents/Resources/Assessment/Information/Project-Scope_COS30049_v2.pdf                                 | Bin 0 -> 162488 bytes
 Documents/Resources/Assessment/Instructions-and-Rubrics/Marking-Rubric_Project-Score-1.pdf               | Bin 0 -> 88791 bytes
 Documents/Resources/Assessment/Instructions-and-Rubrics/Marking-Rubric_Project-Score-1.xlsx              | Bin 0 -> 22499 bytes
 Documents/Resources/Assessment/Project-Information_-COS30049-COMPUTING-TECHNOLOGY-INNOVATION-PROJECT.pdf | Bin 0 -> 84145 bytes
 4 files changed, 0 insertions(+), 0 deletions(-)

### Add assessment resources and marking rubrics
**Author:** darklorddad
**Date:** Mon Oct 6 12:17:25 2025 +0800

Added project scope, project information, and marking rubric files (PDF and XLSX) for COS30049 Computing Technology Innovation Project. These resources provide essential information and assessment criteria for the project.


 Documents/Resources/Assessment/Information/Project-Scope_COS30049_v2.pdf                                 | Bin 0 -> 162488 bytes
 Documents/Resources/Assessment/Instructions-and-Rubrics/Marking-Rubric_Project-Score-1.pdf               | Bin 0 -> 88791 bytes
 Documents/Resources/Assessment/Instructions-and-Rubrics/Marking-Rubric_Project-Score-1.xlsx              | Bin 0 -> 22499 bytes
 Documents/Resources/Assessment/Project-Information_-COS30049-COMPUTING-TECHNOLOGY-INNOVATION-PROJECT.pdf | Bin 0 -> 84145 bytes
 4 files changed, 0 insertions(+), 0 deletions(-)

### Move plant protection document to Documents folder
**Author:** darklorddad
**Date:** Mon Oct 6 12:16:42 2025 +0800

Renamed 'Totally-protected-and-protected-plants.md' to 'Documents/Totally-protected-and-protected-plants.md' to better organize documentation files.


 Totally-protected-and-protected-plants.md => Documents/Totally-protected-and-protected-plants.md | 0
 1 file changed, 0 insertions(+), 0 deletions(-)

### Move plant protection document to Documents folder
**Author:** darklorddad
**Date:** Mon Oct 6 12:16:42 2025 +0800

Renamed 'Totally-protected-and-protected-plants.md' to 'Documents/Totally-protected-and-protected-plants.md' to better organize documentation files.


 Totally-protected-and-protected-plants.md => Documents/Totally-protected-and-protected-plants.md | 0
 1 file changed, 0 insertions(+), 0 deletions(-)

### Update .gitignore to remove Flutter and add docx rules
**Author:** darklorddad
**Date:** Mon Oct 6 12:16:17 2025 +0800

Removed extensive Flutter and platform-specific ignore rules from .gitignore and replaced them with rules to ignore 'System-Design-Proposal.docx' and temporary files starting with '~$'.


 .gitignore | 123 ++-------------------------------------------------------------------------------------------------------------------------
 1 file changed, 2 insertions(+), 121 deletions(-)

### Update .gitignore to remove Flutter and add docx rules
**Author:** darklorddad
**Date:** Mon Oct 6 12:16:17 2025 +0800

Removed extensive Flutter and platform-specific ignore rules from .gitignore and replaced them with rules to ignore 'System-Design-Proposal.docx' and temporary files starting with '~$'.


 .gitignore | 123 ++-------------------------------------------------------------------------------------------------------------------------
 1 file changed, 2 insertions(+), 121 deletions(-)

### refactor: Standardise document filenames with hyphens
**Author:** darklorddad
**Date:** Mon Oct 6 12:05:09 2025 +0800



 Documents/Discussion-reports/{A Strategic Sourcing Plan for Botanical Image Data Acquisition.md => A-Strategic-Sourcing-Plan-for-Botanical-Image-Data-Acquisition.md} | 0
 Documents/Discussion-reports/{Key Concepts in Deep Learning for Image Classification.md => Key-Concepts-in-Deep-Learning-for-Image-Classification.md}                 | 0
 2 files changed, 0 insertions(+), 0 deletions(-)

### refactor: Standardise document filenames with hyphens
**Author:** darklorddad
**Date:** Mon Oct 6 12:05:09 2025 +0800



 Documents/Discussion-reports/{A Strategic Sourcing Plan for Botanical Image Data Acquisition.md => A-Strategic-Sourcing-Plan-for-Botanical-Image-Data-Acquisition.md} | 0
 Documents/Discussion-reports/{Key Concepts in Deep Learning for Image Classification.md => Key-Concepts-in-Deep-Learning-for-Image-Classification.md}                 | 0
 2 files changed, 0 insertions(+), 0 deletions(-)

### docs: Add comprehensive reports on botanical image sourcing and deep learning concepts
**Author:** darklorddad
**Date:** Mon Oct 6 11:36:35 2025 +0800



 Documents/Discussion-reports/A Strategic Sourcing Plan for Botanical Image Data Acquisition.md | 75 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 Documents/Discussion-reports/Key Concepts in Deep Learning for Image Classification.md         | 70 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 145 insertions(+)

### docs: Add comprehensive reports on botanical image sourcing and deep learning concepts
**Author:** darklorddad
**Date:** Mon Oct 6 11:36:35 2025 +0800



 Documents/Discussion-reports/A Strategic Sourcing Plan for Botanical Image Data Acquisition.md | 75 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 Documents/Discussion-reports/Key Concepts in Deep Learning for Image Classification.md         | 70 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 145 insertions(+)

### style: Standardise heading levels and list formatting in strategy doc
**Author:** darklorddad
**Date:** Mon Oct 6 11:02:35 2025 +0800



 Documents/Discussion-reports/Strategy-for-Acquiring-a-Botanical-Image-Dataset-in-Sarawak.md | 38 +++++++++++++++++++-------------------
 1 file changed, 19 insertions(+), 19 deletions(-)

### style: Standardise heading levels and list formatting in strategy doc
**Author:** darklorddad
**Date:** Mon Oct 6 11:02:35 2025 +0800



 Documents/Discussion-reports/Strategy-for-Acquiring-a-Botanical-Image-Dataset-in-Sarawak.md | 38 +++++++++++++++++++-------------------
 1 file changed, 19 insertions(+), 19 deletions(-)

### style: Standardise discussion report formatting
**Author:** darklorddad
**Date:** Mon Oct 6 10:57:47 2025 +0800



 Documents/Discussion-reports/Strategy-for-Acquiring-a-Botanical-Image-Dataset-in-Sarawak.md | 17 +++++++++--------
 1 file changed, 9 insertions(+), 8 deletions(-)

### style: Standardise discussion report formatting
**Author:** darklorddad
**Date:** Mon Oct 6 10:57:47 2025 +0800



 Documents/Discussion-reports/Strategy-for-Acquiring-a-Botanical-Image-Dataset-in-Sarawak.md | 17 +++++++++--------
 1 file changed, 9 insertions(+), 8 deletions(-)

### style: Standardise sub-heading formatting in botanical strategy doc
**Author:** darklorddad
**Date:** Mon Oct 6 10:54:24 2025 +0800



 Documents/Discussion-reports/Strategy-for-Acquiring-a-Botanical-Image-Dataset-in-Sarawak.md | 21 +++++++++++++--------
 1 file changed, 13 insertions(+), 8 deletions(-)

### style: Standardise sub-heading formatting in botanical strategy doc
**Author:** darklorddad
**Date:** Mon Oct 6 10:54:24 2025 +0800



 Documents/Discussion-reports/Strategy-for-Acquiring-a-Botanical-Image-Dataset-in-Sarawak.md | 21 +++++++++++++--------
 1 file changed, 13 insertions(+), 8 deletions(-)

### style: Remove IEEE citations from botanical dataset strategy
**Author:** darklorddad
**Date:** Mon Oct 6 10:46:41 2025 +0800



 Documents/Discussion-reports/Strategy-for-Acquiring-a-Botanical-Image-Dataset-in-Sarawak.md | 26 +++++++++++++-------------
 1 file changed, 13 insertions(+), 13 deletions(-)

### style: Remove IEEE citations from botanical dataset strategy
**Author:** darklorddad
**Date:** Mon Oct 6 10:46:41 2025 +0800



 Documents/Discussion-reports/Strategy-for-Acquiring-a-Botanical-Image-Dataset-in-Sarawak.md | 26 +++++++++++++-------------
 1 file changed, 13 insertions(+), 13 deletions(-)

### docs: Update report title and date
**Author:** darklorddad
**Date:** Mon Oct 6 10:44:17 2025 +0800



 Documents/Discussion-reports/Strategy-for-Acquiring-a-Botanical-Image-Dataset-in-Sarawak.md | 6 ++----
 1 file changed, 2 insertions(+), 4 deletions(-)

### docs: Update report title and date
**Author:** darklorddad
**Date:** Mon Oct 6 10:44:17 2025 +0800



 Documents/Discussion-reports/Strategy-for-Acquiring-a-Botanical-Image-Dataset-in-Sarawak.md | 6 ++----
 1 file changed, 2 insertions(+), 4 deletions(-)

### docs: Add data acquisition strategy report and update dataset notes
**Author:** darklorddad
**Date:** Mon Oct 6 10:42:30 2025 +0800



 Dataset-notes.md                                                                              | 22 ++++++++++++++++------
 Documents/Discussion-reports/Acquiring-a-Comprehensive-Botanical-Image-Dataset-for-Sarawak.md |  2 +-
 Documents/Discussion-reports/Strategy-for-Acquiring-a-Botanical-Image-Dataset-in-Sarawak.md   | 67 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 3 files changed, 84 insertions(+), 7 deletions(-)

### docs: Add data acquisition strategy report and update dataset notes
**Author:** darklorddad
**Date:** Mon Oct 6 10:42:30 2025 +0800



 Dataset-notes.md                                                                              | 22 ++++++++++++++++------
 Documents/Discussion-reports/Acquiring-a-Comprehensive-Botanical-Image-Dataset-for-Sarawak.md |  2 +-
 Documents/Discussion-reports/Strategy-for-Acquiring-a-Botanical-Image-Dataset-in-Sarawak.md   | 67 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 3 files changed, 84 insertions(+), 7 deletions(-)

### docs: Add strategic guide for SmartPlant Sarawak botanical dataset acquisition
**Author:** darklorddad
**Date:** Mon Oct 6 07:28:44 2025 +0800



 Documents/Discussion-reports/Acquiring-a-Comprehensive-Botanical-Image-Dataset-for-Sarawak.md | 224 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 224 insertions(+)

### docs: Add strategic guide for SmartPlant Sarawak botanical dataset acquisition
**Author:** darklorddad
**Date:** Mon Oct 6 07:28:44 2025 +0800



 Documents/Discussion-reports/Acquiring-a-Comprehensive-Botanical-Image-Dataset-for-Sarawak.md | 224 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 224 insertions(+)

### Add taxonomy discussion reports and dataset notes
**Author:** darklorddad
**Date:** Sun Oct 5 22:56:45 2025 +0800

Added new discussion reports on botanical taxonomy and taxonomic rank selection for image data collection. Introduced a dataset notes file listing protected plant species and updated .gitignore to exclude .env files. Minor formatting adjustment in the protected plants list.


 .gitignore                                                                                                |  6 ++++++
 Dataset-notes.md                                                                                          | 49 +++++++++++++++++++++++++++++++++++++++++++++++++
 Documents/Discussion-reports/Navigating-Botanical-Taxonomy-for-Accurate-Species-Identification.md         | 91 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 Documents/Discussion-reports/Selecting-the-Correct-Taxonomic-Ranks-for-Botanical-Image-Data-Collection.md | 67 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 Totally-protected-and-protected-plants.md                                                                 |  4 +++-
 5 files changed, 216 insertions(+), 1 deletion(-)

### Add taxonomy discussion reports and dataset notes
**Author:** darklorddad
**Date:** Sun Oct 5 22:56:45 2025 +0800

Added new discussion reports on botanical taxonomy and taxonomic rank selection for image data collection. Introduced a dataset notes file listing protected plant species and updated .gitignore to exclude .env files. Minor formatting adjustment in the protected plants list.


 .gitignore                                                                                                |  6 ++++++
 Dataset-notes.md                                                                                          | 49 +++++++++++++++++++++++++++++++++++++++++++++++++
 Documents/Discussion-reports/Navigating-Botanical-Taxonomy-for-Accurate-Species-Identification.md         | 91 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 Documents/Discussion-reports/Selecting-the-Correct-Taxonomic-Ranks-for-Botanical-Image-Data-Collection.md | 67 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 Totally-protected-and-protected-plants.md                                                                 |  4 +++-
 5 files changed, 216 insertions(+), 1 deletion(-)

### Change main heading to subheading in document
**Author:** darklorddad
**Date:** Sun Sep 28 07:03:38 2025 +0800

Replaced the H1 heading with an H3 heading for 'Sarawak Forestry Corporation' in the markdown file to adjust the document's heading hierarchy.


 Totally-protected-and-protected-plants.md | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### Change main heading to subheading in document
**Author:** darklorddad
**Date:** Sun Sep 28 07:03:38 2025 +0800

Replaced the H1 heading with an H3 heading for 'Sarawak Forestry Corporation' in the markdown file to adjust the document's heading hierarchy.


 Totally-protected-and-protected-plants.md | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

### Update protected plant list formatting and species
**Author:** darklorddad
**Date:** Tue Sep 23 05:45:11 2025 +0800

Improved formatting by italicizing scientific names and adding missing underscores. Expanded the protected plants list with additional species and corrected several scientific names for accuracy.


 Totally-protected-and-protected-plants.md | 55 ++++++++++++++++++++++++++++++++-----------------------
 1 file changed, 32 insertions(+), 23 deletions(-)

### Update protected plant list formatting and species
**Author:** darklorddad
**Date:** Tue Sep 23 05:45:11 2025 +0800

Improved formatting by italicizing scientific names and adding missing underscores. Expanded the protected plants list with additional species and corrected several scientific names for accuracy.


 Totally-protected-and-protected-plants.md | 55 ++++++++++++++++++++++++++++++++-----------------------
 1 file changed, 32 insertions(+), 23 deletions(-)

### Add .gitignore and protected plants list
**Author:** darklorddad
**Date:** Mon Sep 22 16:47:11 2025 +0800

Added a comprehensive .gitignore for Flutter and related platforms. Introduced a markdown file listing totally protected and protected plant species in Sarawak.


 .gitignore                                | 125 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 Totally-protected-and-protected-plants.md |  33 +++++++++++++++++++++++++++++++++
 2 files changed, 158 insertions(+)

### Add .gitignore and protected plants list
**Author:** darklorddad
**Date:** Mon Sep 22 16:47:11 2025 +0800

Added a comprehensive .gitignore for Flutter and related platforms. Introduced a markdown file listing totally protected and protected plant species in Sarawak.


 .gitignore                                | 125 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 Totally-protected-and-protected-plants.md |  33 +++++++++++++++++++++++++++++++++
 2 files changed, 158 insertions(+)
