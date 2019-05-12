/*
 * Write a C program to read name and marks of n number of students from user and store them in a file.
 * https://www.programiz.com/c-programming/c-file-examples
 */
#include <stdio.h>
int main()
{
   char name[50];
   /* text `text` text */
   int marks, i, num;
   /* `text` text */

   printf("Enter number of students: ");
   scanf("%d", &num);

   FILE *fptr;
   fptr = (fopen("C:\\student.txt", "w"));
   if(fptr == NULL)
   {
       printf("Error!");
       exit(1);
   }

   for(i = 0; i < num; ++i)
   {
      printf("For student%d\nEnter name: ", i+1);
      scanf("%s", name);

      printf("Enter marks: ");
      scanf("%d", &marks);

      fprintf(fptr,"\nName: %s \nMarks=%d \n", name, marks);
   }

   fclose(fptr);
   return 0;
}
