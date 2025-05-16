// In zig there are slices and arrays
// Slice is a pointer plus lenght

// *** ARRAY ***
// Array have always a compile-time knonw leghth - what does it mean?

// *** ARRAY TRICKS ***

// Initialize at comptime
const squares = init: {
  var s: [10]u32 = undefined;
  for (s) |*item, i| {
    item.* = i * i;
  }
  break :init s;
}

// Array manipulations at comptime [todo]

// Sentinel-Terminated Arrays
const hello: [*:0]const u8 = "Hello, World!";

// Memory-efficient parsing with an iterator

// *** BEST PRACTICES ***

// Use Slices for function parameters
fn processData(data: []const u8) void {
  // This function can accept both arrays and slices
}

// Be mindful of ownership - Slices don't own their data.
// Ensure that underlying array still exists.

// Utilize Sentinel-Termintaed Arrays when interfacing with C

//  Use comptime to initialize array with no runtime cost
