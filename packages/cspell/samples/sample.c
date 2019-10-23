/*
    Copied from https://people.sc.fsu.edu/~jburkardt/cpp_src/cpp_arrays/arrays.cpp
    cspell:ignore Burkardt, YMDHMS
*/
# include <cstdlib>
# include <iostream>
# include <iomanip>
# include <ctime>

using namespace std;

int main ( int argc, char *argv[] );
void timestamp ( );

//****************************************************************************80

int main ( int argc, char *argv[] )

//****************************************************************************80
//
//  Purpose:
//
//    Demonstrate the use of arrays.
//
//  Discussion:
//
//    Here is an example of how to set up a dynamic two dimensional array,
//    essentially by declaring it to be a one dimensional array,
//    and doing the double indexing yourself.
//
//  Licensing:
//
//    This code is distributed under the GNU LGPL license.
//
//  Modified:
//
//    07 October 2012
//
//  Author:
//
//    John Burkardt
//
{
  int a[10];
  int *b;
  int c[5][5];
  int *d;
  int *e;
  int i;
  int j;
  int k;

  timestamp ( );
  cout << "\n";
  cout << "ARRAYS\n";
  cout << "  C++ version\n";
  cout << "\n";
  cout << "  Examples of array use.\n";
  cout << "  We show, in particular, a way that you can create and use\n";
  cout << "  a matrix (double dimensioned array) as though it were a\n";
  cout << "  single dimensioned array, as long as you are willing to\n";
  cout << "  compute the proper index yourself.\n";

  for ( i = 0; i < 10; i++ )
  {
    a[i] = 500 + i;
  }

  cout << "\n";
  cout << "The statically dimensioned vector A:\n";
  cout << "\n";
  cout << "       i    A[i]\n";
  cout << "\n";
  for ( i = 0; i < 10; i++ )
  {
    cout << "  " << setw(6) << i
         << "  "<< setw(6) << a[i] << "\n";
  }

  b = new int[10];

  for ( i = 0; i < 10; i++ )
  {
    b[i] = 500 + i;
  }

  cout << "\n";
  cout << "The dynamically dimensioned vector B:\n";
  cout << "\n";
  cout << "       i    B[i]\n";
  cout << "\n";

  for ( i = 0; i < 10; i++ )
  {
    cout << "  " << setw(6) << i
         << "  " << setw(6) << b[i] << "\n";
  }

  delete [] b;

  for ( j = 0; j < 5; j++ )
  {
    for ( i = 0; i < 5; i++ )
    {
      c[i][j] = 10 * ( i + 1 ) + ( j + 1 );
    }
  }

  cout << "\n";
  cout << "The statically dimensioned array C[][]:\n";
  cout << "\n";
  cout << "       k       i       j C[i][j]\n";
  cout << "\n";
  k = 0;
  for ( j = 0; j < 5; j++ )
  {
    for ( i = 0; i < 5; i++ )
    {
      cout << "  " << setw(6) << k
           << "  " << setw(6) << i
           << "  " << setw(6) << j
           << "  " << setw(6) << c[i][j] << "\n";
      k = k + 1;
    }
  }

  d = new int[5*7];

  for ( j = 0; j < 7; j++ )
  {
    for ( i = 0; i < 5; i++ )
    {
      d[i+j*5] = 10 * ( i + 1 ) + ( j + 1 );
    }
  }

  cout << "\n";
  cout << "The dynamically dimensioned column-major vector D[]:\n";
  cout << "\n";
  cout << "       k       i       j D[i+j*5]\n";
  cout << "\n";

  k = 0;
  for ( j = 0; j < 7; j++ )
  {
    for ( i = 0; i < 5; i++ )
    {
      cout << "  " << setw(6) << k
           << "  " << setw(6) << i
           << "  " << setw(6) << j
           << "  " << setw(6) << d[i+j*5] << "\n";
      k = k + 1;
    }
  }

  delete [] d;

  e = new int[5*7];

  for ( j = 0; j < 7; j++ )
  {
    for ( i = 0; i < 5; i++ )
    {
      e[i*7+j] = 10 * ( i + 1 ) + ( j + 1 );
    }
  }

  cout << "\n";
  cout << "The dynamically dimensioned row-major vector E[]:\n";
  cout << "\n";
  cout << "       k       i       j E[i*7+j]\n";
  cout << "\n";

  k = 0;
  for ( i = 0; i < 5; i++ )
  {
    for ( j = 0; j < 7; j++ )
    {
      cout << "  " << setw(6) << k
           << "  " << setw(6) << i
           << "  " << setw(6) << j
           << "  " << setw(6) << e[i*7+j] << "\n";
      k = k + 1;
    }
  }

  delete [] e;
//
//  Terminate.
//
  cout << "\n";
  cout << "ARRAYS:\n";
  cout << "  Normal end of execution.\n";

  cout << "\n";
  timestamp ( );

  return 0;
}
//****************************************************************************80

void timestamp ( )

//****************************************************************************80
//
//  Purpose:
//
//    TIMESTAMP prints the current YMDHMS date as a time stamp.
//
//  Example:
//
//    May 31 2001 09:45:54 AM
//
//  Licensing:
//
//    This code is distributed under the GNU LGPL license.
//
//  Modified:
//
//    03 October 2003
//
//  Author:
//
//    John Burkardt
//
//  Parameters:
//
//    None
//
{
# define TIME_SIZE 40

  static char time_buffer[TIME_SIZE];
  const struct tm *tm;
  size_t len;
  time_t now;

  now = time ( NULL );
  tm = localtime ( &now );

  len = strftime ( time_buffer, TIME_SIZE, "%d %B %Y %I:%M:%S %p", tm );

  cout << time_buffer << "\n";

  return;
# undef TIME_SIZE
}
