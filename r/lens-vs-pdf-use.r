# read in a csv file with data on lens vs pdf vs pageview data
# plot the ratio of lens use to pdf downloads over time
lens = read.csv("~/Downloads/lens_vs_pdf_csv//Sheet 1-Table 1.csv", header = TRUE)
lensviewsnums = as.numeric(gsub(",","",lensviews))
plot(as.Date(lens$date, '%m/%d/%y'), lensviewsnums, type="l")
lenspdfratio <- lens$lens/lens$PDF
par(lwd="2")
plot(as.Date(lens$date, '%m/%d/%y'), lenspdfratio, type="l", main="lens to PDF ratio", xlab="date", ylab="ratio")
