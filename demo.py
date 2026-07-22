l1=[50,40,30,20,15];

temp=0
for i in range(0,5):
    for j in range(0,4-i):
        if l1[j]>l1[j+1]:
            temp=l1[j]
            l1[j]=l1[j+1]
            l1[j+1]=temp
        j=j+1;
    i=i+1;

for i in range(0,5):
    print(l1[i]);
            
    