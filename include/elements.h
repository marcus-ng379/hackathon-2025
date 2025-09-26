#ifndef ELEMENTS_H

#define ELEMENTS_H
#include <bits/stdc++.h>
using namespace std;
class elements {
 private:
  int atomicNumber;
  double atomicWeight;

 protected:
  string symbol, name, group;

 public:
  elements(string symbol, string name, string group, int atomicNumber,
           int atomicWeight);
  elements(string symbol);
};

#endif