library(gdata)
help(package=gdata)
install.packages("gdata")
library(gdata)
testdata = read.xls("~/code/private-code//poa-xls-files/ejp_queries_v1.04/poa_manuscript_v1.04.xls")
testdata
testcsvdata = read.xls("~/code/private-code//poa-xls-files/csv-input-v1.06.dummy/ejp_query_tool_query_id_180_POA_Received_2014_02_12_eLife.csv")
testcsvdata = read.csv("~/code/private-code//poa-xls-files/csv-input-v1.06.dummy/ejp_query_tool_query_id_180_POA_Received_2014_02_12_eLife.csv")
library(devtools)
install devtools
install.packages("devtools")
install.packages("RCurl")
install.packages("rjson")
install_github("rjson")
install.packages("rjson")require(devtools)
require(devtools)
install_github("rjson")
install_github("elife", "rOpenSci")
require(elife)
dois <- searchelife(terms = "*", searchin = "article_title", boolean = "matches")
dois
elife_doi(dois="10.7554/eLife.00160")
elife_doi(dois="10.7554/eLife.00160", ret="pub_date_date")
dois
dois.sort();
dois.max
dois.max()
elife_doi(dois="10.7554/eLife.02517")
elife_doi(dois="10.7554/eLife.00160", ret="subject_area")
for d in dois{}
for (d in dois){doi}
for (d in dois){d}
for (d in dois){d.1}
dois
for (d in dois){len(d)}
count = 0
for (d in dois){count = count+1}
count
for (d in dois){elife_doi(dois=d, ret="subject_area")}
abs <- sapply(dois, function(x) elife_doi(x, ret = "subject_area"))
abs
dates <- sapply(dois, function(x) elife_doi(x, ret = "pub_date_date"))
dates
write.csv(dates)
write.csv(dates, file="dates.csv")
write.csv(dates, file="dates.csv", row.names=True)
write.csv(dates, file="dates.csv", row.names=TRUE)
dates
write.csv(abs, file="subjects.csv", row.names=TRUE)
abs
write.csv(abs, file="subjects.csv", row.names=TRUE)
lapply(abs, write, "subs.txt", append=TRUE)
write.data(abs, file="subjects.txt")
write.table(abs, file="subjects.txt")
ls
abs
abs[1]
abs[5]
abs[5][2]
abs[5][1]
abs[5]
abs[5][0]
abs[5][1]
ls(abs)
abs
abs.1
abs[5].1
abs[5]
ls(abs[5]0
ls(abs[5])
ls(abs)
names(abs[5])
names(abs[5][1])
abs
abs[5]
ls(abs[5])
ls(abs)
get(abs[5])
names(abs[5])
abs[3]
names(abs[3])
values(abs[3])
value(abs[3])
list(abs[5])
unlist(abs[5])
names(abs)
for(name in names(abs)){unlist(name)}
for(name in names(abs)){print unlist(name)}
for(name in names(abs)){print(name)}
for(name in names(abs)){print(name)}
for(name in names(abs)){print(name) <br/>}
for(name in names(abs)){print(name) print(unlist(name))}
for(name in names(abs)){print(name), print(unlist(name))}
for(name in names(abs)){print(name)}
for(name in names(abs)){print(unlist(name))}
for(name in names(abs)){print(unlist(name)), print(name)}
for(name in names(abs)){print (unlist(name))}
for (i in length(abs)){i}
for (i in length(abs)){print(i)}
for(name in names(abs)){print(name)}
for(name in names(abs)){print(names(name))}
abs
abs[[3]][1]
for(row in abe)(print(row))
for(row in abs)(print(row))
for(row in abs)(print(row), print(abs))
for(row in abs)(print(row)  print(abs))
for(row in abs)(print(row)
)
for(row in abs)(print(row, abs)
)
for(row in abs)(print(row, abs)fileConn<-file("output.txt")
fileConn<-file("output.txt")
sink("outtext.txt")
lapply(abs, print)
sink()
abs[1]
dates
sink("dates.txt")
lapply(dates, print)
sink()
lens = read.csv("~/Downloads/lens_vs_pdf_csv.csv", header = TRUE)
lens = read.csv("~/Downloads/lens_vs_pdf_csv//Sheet 1-Table 1.csv", header = TRUE)
lens
plot(as.Date(lens$date))
plot(as.Date(lens$date, %m/%d/%y))
plot(as.Date(lens$date, '%m/%d/%y'))
plot(as.Date(lens$date, '%m/%d/%y'), lens$pageviews)
plot(as.Date(lens$date, '%m/%d/%y'), lens$pageviews, type="l")
lens
lens.show
lens.show()
lens
lens$pageviews
plot(as.Date(lens$date, '%m/%d/%y'), lens$pageviews, type="l")
plot(lens)
plot(as.Date(lens$date, '%m/%d/%y'), lens$lens, type="l")
lensviews <- lens$pageviews
lensviewsnums = as.numeric(gsub(",","",lensviews))
plot(as.Date(lens$date, '%m/%d/%y'), lensviewsnums, type="l")
plot(as.Date(lens$date, '%m/%d/%y'), lens$lens.., type="l")
plot(as.Date(lens$date, '%m/%d/%y'), as. lens$lens.., type="l")
lens$lens..
plot(as.Date(lens$date, '%m/%d/%y'), as. lens$lens.., type="l")
plot(as.Date(lens$date, '%m/%d/%y'), lens$lens.., type="l")
plot(as.Date(lens$date, '%m/%d/%y'), lens$lens/lensviewsnums, type="l")
plot(as.Date(lens$date, '%m/%d/%y'), lens$lens/lens$pdf, type="l")
plot(as.Date(lens$date, '%m/%d/%y'), lens$lens/lens$PDF, type="l")
plot(as.Date(lens$date, '%m/%d/%y'), lens$PDF/lens$PDF, type="l")
plot(as.Date(lens$date, '%m/%d/%y'), lens$PDF/lens$PDF, type="l")
lens$PDF
lens$lens
lens$lens/lens$PDF
lenspdfratio <- lens$lens/lens$PDF
plot(as.Date(lens$date, '%m/%d/%y'), lenspdfratio, type="l")
plot(as.Date(lens$date, '%m/%d/%y'), lenspdfratio, type="l", main="lens to PDF ratio")
plot(as.Date(lens$date, '%m/%d/%y'), lenspdfratio, type="l", main="lens to PDF ratio", xlab="date")
plot(as.Date(lens$date, '%m/%d/%y'), lenspdfratio, type="l", main="lens to PDF ratio", xlab="date", ylab="ratio")
?par
par(lwt="2")
par(lwd="2")
plot(as.Date(lens$date, '%m/%d/%y'), lenspdfratio, type="l", main="lens to PDF ratio", xlab="date", ylab="ratio")
par(col="green")
plot(as.Date(lens$date, '%m/%d/%y'), lenspdfratio, type="l", main="lens to PDF ratio", xlab="date", ylab="ratio")
par(col="black")
plot(as.Date(lens$date, '%m/%d/%y'), lenspdfratio, type="l", main="lens to PDF ratio", xlab="date", ylab="ratio")
par()
par(col="green")
par(col.axis="black")
plot(as.Date(lens$date, '%m/%d/%y'), lenspdfratio, type="l", main="lens to PDF ratio", xlab="date", ylab="ratio")
par(col="black")
plot(as.Date(lens$date, '%m/%d/%y'), lenspdfratio, type="l", main="lens to PDF ratio", xlab="date", ylab="ratio")
history
singk
sink
savehistory()
