import { run } from './utils';

describe('array', () => {
  let ret: any = undefined;
  let error: any = undefined;

  beforeEach(() => {
    ret = error = undefined;
  });

  it('array works', async () => {
    const code = `
sub main
  dim m(1) as Integer
  m(0)=1
  test2 m(0), m(1)
  MsgBox m(0)
  MsgBox m(1)
end sub

sub test2(byVal a as Integer, b as Integer)
  a=3
  b=2
end sub
    `;
    ret = await run(code);
    expect(ret).toMatchInlineSnapshot(`
      Array [
        1,
        2,
      ]
    `);
  });

  it('multi dimension works', async () => {
    let code = `
sub main
  dim m(1 to 2, 3 to 4) as Integer
  m(1,3)=1
  m(1,4)=2
  MsgBox m(1,3)
  MsgBox m(1,4)
end sub   
  `;
    ret = await run(code);
    expect(ret).toMatchInlineSnapshot(`
      Array [
        1,
        2,
      ]
    `);

    code = `
sub main
  dim m(1 to 2, 3 to 4) as Integer
  m(1,3)=1
  m(1,4)=2
  MsgBox m(1,5)
end sub   
  `;

    try {
      await run(code);
    } catch (e) {
      error = e;
    }

    expect(() => {
      throw error;
    }).toThrowErrorMatchingInlineSnapshot(`"Subscript out of Range"`);
  });

  it('redim works', async () => {
    try {
      await run(`
      sub main
      dim x() as Integer
      msbox x(0)
      end sub    
          `);
    } catch (e) {
      error = e;
    }

    expect(() => {
      throw error;
    }).toThrowErrorMatchingInlineSnapshot(`"Subscript out of Range"`);

    error = undefined;

    try {
      await run(`
      sub main
      dim x(0 to 4) as Integer
      redim x(0 to 4)
      end sub    
          `);
    } catch (e) {
      error = e;
    }

    expect(() => {
      throw error;
    }).toThrowErrorMatchingInlineSnapshot(`"unexpected redim!"`);

    ret = await run(`
sub main
dim x() as Integer
redim x(0 to 2)
x(0) =1 
msgbox x(0)
redim x(0 to 2)
msgbox x(0)
x(0) =1 
redim preserve x(0 to 3)
x(3) =1 
msgbox x(0)
msgbox x(3)
end sub     
     `);
    expect(ret).toMatchInlineSnapshot(`
      Array [
        1,
        0,
        1,
        1,
      ]
    `);
  });

  it('erase works', async () => {
    ret = await run(`
sub main
dim y(0 to 2) as Integer
y(0) = 1
msgbox y(0)
erase y
msgbox y(0)
end sub     
     `);
    expect(ret).toMatchInlineSnapshot(`
      Array [
        1,
        0,
      ]
    `);

    try {
      await run(`
  sub main
  dim x() as Integer
  redim x(0 to 2)
  x(0) = 1
  msgbox x(0)
  erase x
  msgbox x(0)
  end sub     
      `);
    } catch (e) {
      error = e;
    }

    expect(() => {
      throw error;
    }).toThrowErrorMatchingInlineSnapshot(`"Subscript out of Range"`);
  });
});
