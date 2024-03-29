import { useEffect, useState } from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { UseApi } from "../../libs/useApi";
import { Tenant } from "../../types/Tenant";
import { useAppContext } from "../../contexts/app";
import styles from '../../styles/Checkout.module.css'
import { getCookie } from "cookies-next";
import { User } from "../../types/User";
import { useAuthContext } from "../../contexts/auth";
import { Header } from "../../components/Header";
import { InputField } from "../../components/InputField";
import { Button } from "../../components/Button";
import { useFormatter } from "../../libs/useFormatter";
import { CartItem } from "../../types/CartItem";
import { useRouter } from "next/router";
import { CartProductItem } from "../../components/CartProductItem/Index";
import {ButtonWithIcon} from "../../components/ButtonWithIcon";

const Checkout = (data: Props) =>{

    const {setToken, setUser} = useAuthContext()
    const {tenant, setTenant, shippingAddress, shippingPrice} = useAppContext()
    const formater = useFormatter()
    const router = useRouter()
    const api = UseApi(data.tenant.slug)

    // product control
    const [cart, setCart] = useState<CartItem[]>(data.cart)

    //shipping
    const handleChangeAddress = () =>{
        router.push(`/${data.tenant.slug}/myaddress`)
    }

    // payments
    const [paymentType, setPaymentType] = useState<'money' | 'card'>('money')
    const [paymentChange, setPaymentChange] = useState(0)

    // cupom
    const [cupom, setCupom] = useState('')
    const [cupomDiscount, setCupomDiscount] = useState(0)
    const [cupomInput, setCupomInput] = useState('')

    const handleSetCupom = () =>{
        if(cupomInput){
            setCupom(cupomInput)
            setCupomDiscount(15.2)
        }
    }

    //resume
    const [subTotal, setSubTotal] = useState(1)

    useEffect(()=>{
        let sub = 0
        for(let i in cart){
            sub += cart[i].product.price * cart[i].qt
        }
        setSubTotal(sub)
    }, [cart])

    useEffect(()=>{
        setTenant(data.tenant)
        setToken(data.token)
        if(data.user) setUser(data.user)
    }, [])

    const handleFinish = async () => {
        if(shippingAddress){
            const order = await api.setOrder(
                shippingAddress,
                paymentType,
                paymentChange,
                cupom,
                data.cart
            )
            if(order){
                router.push(`/${data.tenant.slug}/order/${order.id}`)
            } else {
                alert('Ocorreu um erro, tente novamente!')
            }
        }
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Checkout | {data.tenant.name} </title>
            </Head>

            <Header
                backHref={`/${data.tenant.slug}`}
                color={data.tenant.mainColor}
                title="Checkout"
            />

            <div className={styles.productquantity}>
                {cart.length} {cart.length === 1 ? 'Item' : 'Itens'}
            </div>

            <div className={styles.infoGroup}>

            <div className={styles.infoArea}>
                <div className={styles.infoTitle}>
                    Endereço
                </div>
                <div className={styles.infoBody}>
                    <ButtonWithIcon
                        color={data.tenant.mainColor}
                        leftIcon={"location"}
                        rightIcon={"rightArrow"}
                        value={shippingAddress
                            ? `${shippingAddress.street} - ${shippingAddress.number} - ${shippingAddress.neighborhood} 
                            - ${shippingAddress.city} - ${shippingAddress.cep}`
                            : 'Escolha um endereço'}
                        onClick={handleChangeAddress}
                    />
                </div>
            </div>

            <div className={styles.infoArea}>
                <div className={styles.infoTitle}>
                    Forma de Pagamento
                </div>
                <div className={styles.infoBody}>
                    <div className={styles.paymentType}>
                        <div className={styles.paymentBtn}>
                            <ButtonWithIcon
                               color={data.tenant.mainColor}
                               leftIcon="money"
                               value="Dinheiro"
                               onClick={()=> setPaymentType('money')}
                               fill={paymentType === 'money'}/>
                        </div>

                        <div className={styles.paymentBtn}>
                            <ButtonWithIcon
                                color={data.tenant.mainColor}
                                leftIcon="card"
                                value="Cartão"
                                onClick={()=>setPaymentType('card')}
                                fill={paymentType === 'card'}
                            />
                        </div>
                    </div>
                </div>
            </div>

                {paymentType === 'money' &&
                    <div className={styles.infoArea}>
                    <div className={styles.infoTitle}>
                        Troco
                    </div>
                    <div className={styles.infoBody}>
                        <InputField
                            color={data.tenant.mainColor}
                            placeholder="Informe o valor para sabermos o troco"
                            value={paymentChange ? paymentChange.toString() : ''}
                            onChange={newValue => setPaymentChange(parseInt(newValue))}/>
                    </div>
                </div>}

            <div className={styles.infoArea}>
                <div className={styles.infoTitle}>
                    Cupom de Desconto
                </div>
                <div className={styles.infoBody}>
                    {cupom &&
                        <ButtonWithIcon
                            color={data.tenant.mainColor}
                            value={cupom.toUpperCase()}
                            leftIcon="cupom"
                            rightIcon="checked"
                        />
                    }

                    {!cupom &&
                        <div className={styles.cupomInput}>
                            <InputField 
                                color={data.tenant.mainColor}
                                placeholder="Tem um cupom?"
                                value={cupomInput}
                                onChange={newValue => setCupomInput(newValue)}
                            />
                            <Button
                                color={data.tenant.mainColor}
                                label="Ok"
                                onClick={handleSetCupom}
                            />
                        </div>
                    }
                </div>
            </div>

            </div>


            <div className={styles.productList}>
                {cart.map((cartItem, index)=>(
                    <CartProductItem 
                        key={index}
                        color={data.tenant.mainColor}
                        quantity={cartItem.qt}
                        product={cartItem.product}
                        onChange={()=>{} }
                        noEdit
                    />
                ))}
            </div>

            <div className={styles.resumeArea}>
                <div className={styles.resumeItem}>
                    <div className={styles.resumeLeft}>Subtotal</div>
                    <div className={styles.resumeRight}>{formater.formatPrice(subTotal)}</div>
                </div>
                {cupomDiscount > 0 &&
                    <div className={styles.resumeItem}>
                        <div className={styles.resumeLeft}>Desconto</div>
                        <div className={styles.resumeRight}>-{formater.formatPrice(cupomDiscount)}</div>
                    </div>
                }

                <div className={styles.resumeItem}>
                    <div className={styles.resumeLeft}>Frete</div>
                    <div className={styles.resumeRight}>{shippingPrice > 0 ? formater.formatPrice(shippingPrice) : '--'}</div>
                </div>

                <div className={styles.resumeLine}></div>

                <div className={styles.resumeItem}>
                    <div className={styles.resumeLeft}>Total</div>
                    <div 
                        className={styles.resumeRightBig}
                        style={{color:data.tenant.mainColor}}
                        >{shippingPrice > 0 ? formater.formatPrice(subTotal - cupomDiscount + shippingPrice) : '--'}</div>
                </div>

                <div className={styles.resumeBtn}>
                    <Button
                        color={data.tenant.mainColor}
                        label="Finalizar Pedido"
                        onClick={handleFinish}
                        fill
                        disabled={!shippingAddress}
                    />
                </div>
            </div>
        </div>
    )
}

export default Checkout

type Props = {
    tenant: Tenant,
    token: string,
    user: User | null,
    cart: CartItem[]
}

export const getServerSideProps: GetServerSideProps = async (context)=>{
    const {tenant: tenantSlug} = context.query
    const api = UseApi(tenantSlug as string)
    
    //get tenant
    const tenant = await api.getTenant()
    if(!tenant){
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

    // get logged user
    const token = getCookie('token', context) ?? null
    const user = await api.authorizeToken(token as string)

    // get cart product
    const cartCookie = getCookie('cart', context)
    const cart = await api.getCartProducts(cartCookie as string)
    console.log('cart ->', cart)
    
    return {
        props:{
            tenant,
            user,
            token,
            cart
        }
    }
}
