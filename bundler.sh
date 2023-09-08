#!/bin/bash

cp -r build bundled
rm -rf bundled/web-ext-artifacts/
rm bundled.zip
zip -r bundled.zip bundled
rm -rf bundled
