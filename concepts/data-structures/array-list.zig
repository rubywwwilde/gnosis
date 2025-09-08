//! ArrayList is a data structure that allows dynamically resize arrays
//!
//! Parameters: intial capacity, growth factor
//!
//! Operations:
//! - push - adds at the end
//! - pop - removes from the end
//! - insert - inserts element at a position
//! - unshift - adds at the start
//! - shift - removes from the start
//! - get - gets element at a position
//! - set - sets element at a position
//! - remove - removes element from a position
//!
//! Utilities:
//! - isEmpty()
//! - clear()
//! - contains(value)
//! - indexOf(value)
//! - toArray() - returns a new fixed-size array
//!
//! Error handling:
//! - IndexOutOfBoundException
//! - Calling pop() or shift() on empty list - NoSuchElement or null? What is better here?
//!   If throwing an exception, that requires to check every time if there was an error,
//!   but returning null is confusing, cause the element might be null.
//!
//! Should there be a default init_cap? What cap is reasonable then?
//! How to make a default argument in zig?

pub fn makeArrayList(init_cap: usize) i32 {}
