# install the required packags
install.packages("devtools")
install.packages("RCurl")
install.packages("rjson")
require(devtools)
install_github("elife", "rOpenSci")
require(elife)
# get dois
dois <- searchelife(terms = "*", searchin = "article_title", boolean = "matches")
# print subject areas
for (d in dois){elife_doi(dois=d, ret="subject_area")}
# put subject areas into an object
subjects <- sapply(dois, function(x) elife_doi(x, ret = "subject_area"))
# put dates into an object
dates <- sapply(dois, function(x) elife_doi(x, ret = "pub_date_date"))