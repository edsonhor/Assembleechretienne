# Assembleechretienne

This is where I track Assemblee Chretienne node.js changes.

Assemblee Chretienne is a small church located in Port au Prince Haiti. The church has 
been runing for more than 40 years. As on now, the church is trying to raise money (US 50K) so 
that they can aquire a house that is located right next to the church. The house will
be destroyed and used as a parking lot with extra spaces for a clinic where people in 
the community can come and get medical attention.

The way that the church was trying to raise money in the USA from past members was not
efficient. They would give the routing number and the account number where the donor would
go and add money to the account.

I realize that using technology can solve this problem and started to build a website 
that would facilitate the receive of gift from donors.

The site is build using a single page structure. The back end is a node.js application that
handle the routing. There is a redis application runing to handle session. when 
data is not on the redis, then a call to a java based application is made.

The java appliaction handle all the database CRUD operation. It's a restful API that not 
only interact with the database, but also is responsible for adding data into the redis cache.

The user interface of the web applicaiton is a variation of semantic ui which is a css framework
for user interface and Angularjs2 which is the latest version of angular. 

This applicaiton is a work in progress and there would be update made all the time. If there is 
any way i can improve the web application, please drom me an email.

Thanks,
Edson H Philippe 
Software Engineer